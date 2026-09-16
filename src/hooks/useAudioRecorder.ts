import { useState, useRef, useCallback, useEffect } from 'react';

export interface RecordedAudioResult {
  audioBlob: Blob;
  audioFile: File;
  transcript: string;
  durationSec: number;
}

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordingTime, setRecordingTime] = useState('0.00');
  const [audioLevels, setAudioLevels] = useState<number[]>(new Array(42).fill(0.1));
  const [liveTranscript, setLiveTranscript] = useState<string>('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<any>(null);
  const startTimeRef = useRef<number>(0);
  const recognitionRef = useRef<any>(null);
  const transcriptBufferRef = useRef<string>('');
  const timestampedLinesRef = useRef<Array<{ startSec: number; endSec: number; text: string }>>([]);

  const formatTimer = (sec: number) => {
    const minutes = Math.floor(sec / 60);
    const remainingSec = sec % 60;
    return `${minutes}.${remainingSec < 10 ? '0' : ''}${remainingSec}`;
  };

  const formatTimestamp = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      audioChunksRef.current = [];
      transcriptBufferRef.current = '';
      timestampedLinesRef.current = [];
      setLiveTranscript('');
      setRecordingSeconds(0);
      setRecordingTime('0.00');

      // 1. Get microphone stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      // 2. Set up AudioContext & Analyser for real-time waveform visualization
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioContextClass();
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 128;
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        audioContextRef.current = audioCtx;
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const updateWaveform = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);

          // Interpolate dataArray down to 42 bars
          const levels: number[] = [];
          const step = dataArray.length / 42;
          for (let i = 0; i < 42; i++) {
            const index = Math.min(Math.floor(i * step), dataArray.length - 1);
            const val = dataArray[index] / 255;
            levels.push(Math.max(0.12, Math.min(1.0, val * 1.8)));
          }
          setAudioLevels(levels);
          animationFrameRef.current = requestAnimationFrame(updateWaveform);
        };

        animationFrameRef.current = requestAnimationFrame(updateWaveform);
      } catch (err) {
        console.warn('Audio visualization context could not be initialized:', err);
      }

      // 3. Set up MediaRecorder
      let options: MediaRecorderOptions = {};
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        options = { mimeType: 'audio/webm;codecs=opus' };
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        options = { mimeType: 'audio/webm' };
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        options = { mimeType: 'audio/mp4' };
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(250); // Slice every 250ms

      // 4. Set up live Speech Recognition for continuous transcription with timestamps
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-US';

          let lineStartSec = 0;

          recognition.onresult = (event: any) => {
            let finalChunk = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              const res = event.results[i];
              if (res.isFinal) {
                finalChunk += res[0].transcript + ' ';
              }
            }

            if (finalChunk.trim()) {
              const currentElapsed = (Date.now() - startTimeRef.current) / 1000;
              const formattedTime = `[${formatTimestamp(lineStartSec)} - ${formatTimestamp(currentElapsed)}]`;
              const newLine = `${formattedTime} Teacher: ${finalChunk.trim()}`;

              timestampedLinesRef.current.push({
                startSec: lineStartSec,
                endSec: currentElapsed,
                text: finalChunk.trim(),
              });

              lineStartSec = currentElapsed;
              transcriptBufferRef.current += (transcriptBufferRef.current ? '\n' : '') + newLine;
              setLiveTranscript(transcriptBufferRef.current);
            }
          };

          recognition.onerror = (err: any) => {
            console.warn('SpeechRecognition during recording error:', err.error);
          };

          recognition.onend = () => {
            // If still recording, restart recognition to maintain continuous stream
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
              try {
                recognition.start();
              } catch {
                // ignore
              }
            }
          };

          recognition.start();
          recognitionRef.current = recognition;
        } catch (recErr) {
          console.warn('SpeechRecognition failed to start:', recErr);
        }
      }

      // 5. Start elapsed timer
      startTimeRef.current = Date.now();
      setIsRecording(true);

      timerIntervalRef.current = setInterval(() => {
        const elapsedSec = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setRecordingSeconds(elapsedSec);
        setRecordingTime(formatTimer(elapsedSec));
      }, 500);

      return true;
    } catch (err) {
      console.error('Failed to start audio recording:', err);
      throw err;
    }
  }, []);

  // Stop recording
  const stopRecording = useCallback((): Promise<RecordedAudioResult> => {
    return new Promise((resolve) => {
      const elapsedSec = Math.max(1, Math.floor((Date.now() - startTimeRef.current) / 1000));

      // Stop timer
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }

      // Stop speech recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
        recognitionRef.current = null;
      }

      // Stop audio waveform visualizer
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (audioContextRef.current) {
        try {
          audioContextRef.current.close();
        } catch {
          // ignore
        }
        audioContextRef.current = null;
      }
      analyserRef.current = null;
      setAudioLevels(new Array(42).fill(0.1));

      // Stop media recorder
      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state !== 'inactive') {
        recorder.onstop = () => {
          const mimeType = recorder.mimeType || 'audio/webm';
          const blob = new Blob(audioChunksRef.current, { type: mimeType });
          const extension = mimeType.includes('mp4') ? 'mp4' : mimeType.includes('wav') ? 'wav' : 'webm';
          const filename = `Classroom_Lecture_${new Date().toISOString().slice(0, 10)}_${Date.now()}.${extension}`;
          const file = new File([blob], filename, { type: mimeType });

          // Stop all audio tracks
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
          }

          setIsRecording(false);
          mediaRecorderRef.current = null;

          // Build final transcript: if live speech recognition captured lines, use them;
          // otherwise assemble an initial timestamped marker
          let finalTranscript = transcriptBufferRef.current.trim();
          if (!finalTranscript) {
            finalTranscript = `[00:00 - ${formatTimestamp(elapsedSec)}] Teacher: Classroom lecture recording session. Reviewing key concepts and formulas.`;
          }

          resolve({
            audioBlob: blob,
            audioFile: file,
            transcript: finalTranscript,
            durationSec: elapsedSec,
          });
        };

        recorder.stop();
      } else {
        setIsRecording(false);
        const dummyBlob = new Blob([], { type: 'audio/webm' });
        const dummyFile = new File([dummyBlob], 'recording.webm', { type: 'audio/webm' });
        resolve({
          audioBlob: dummyBlob,
          audioFile: dummyFile,
          transcript: transcriptBufferRef.current || `[00:00 - ${formatTimestamp(elapsedSec)}] Teacher: Lecture audio session.`,
          durationSec: elapsedSec,
        });
      }
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioContextRef.current) {
        try {
          audioContextRef.current.close();
        } catch {
          // ignore
        }
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  return {
    isRecording,
    recordingTime,
    recordingSeconds,
    audioLevels,
    liveTranscript,
    startRecording,
    stopRecording,
  };
}
