/**
 * Speech Service
 * Provides robust, cross-browser Web Speech API utilities:
 * - Text-To-Speech (TTS) with sentence chunking, Chromium garbage collection fix,
 *   Chromium 15s pause keep-alive fix, asynchronous cancel race condition protection,
 *   and LaTeX/Markdown cleanup for natural audio narration.
 * - Speech-To-Text (STT) with fresh SpeechRecognition instantiation, full transcript
 *   accumulation, and friendly permission error handling.
 */

// Module-level reference to prevent Chromium V8 garbage collection of active utterances
let activeUtterance: SpeechSynthesisUtterance | null = null;
let keepAliveTimer: any = null;
let currentChunkIndex = 0;
let textChunks: string[] = [];
let currentOptions: SpeakOptions | null = null;
let activeRecognition: any = null;

export interface SpeakOptions {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err?: any) => void;
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
}

export interface ListenOptions {
  onStart?: () => void;
  onResult: (transcript: string, isFinal: boolean) => void;
  onError?: (errorMessage: string, rawError?: any) => void;
  onEnd?: () => void;
  lang?: string;
}

/**
 * Check if browser supports Text-To-Speech
 */
export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

/**
 * Check if browser supports Speech-To-Text
 */
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
}

/**
 * Clean markdown, LaTeX, emojis, and symbols into natural speakable English
 */
export function cleanTextForSpeech(text: string): string {
  if (!text) return '';

  let cleaned = text
    // Replace markdown links [text](url) with just text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove raw URLs
    .replace(/https?:\/\/\S+/g, '')
    // Replace common LaTeX math commands with natural spoken phrases
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1 divided by $2')
    .replace(/\\sqrt\{([^}]+)\}/g, 'square root of $1')
    .replace(/\\times/g, ' times ')
    .replace(/\\cdot/g, ' times ')
    .replace(/\\div/g, ' divided by ')
    .replace(/\\pm/g, ' plus or minus ')
    .replace(/\\approx/g, ' approximately ')
    .replace(/\\neq/g, ' is not equal to ')
    .replace(/\\le/g, ' less than or equal to ')
    .replace(/\\ge/g, ' greater than or equal to ')
    .replace(/\\implies/g, ' implies that ')
    .replace(/\\rightarrow/g, ' yields ')
    .replace(/\\Delta/g, 'delta ')
    .replace(/\\Omega/g, 'ohms ')
    .replace(/\\rho/g, 'rho ')
    .replace(/\\theta/g, 'theta ')
    .replace(/\\pi/g, 'pi ')
    .replace(/\\alpha/g, 'alpha ')
    .replace(/\\beta/g, 'beta ')
    .replace(/\\lambda/g, 'lambda ')
    .replace(/\\mu/g, 'micro ')
    .replace(/\\degree/g, ' degrees ')
    .replace(/\\%/g, ' percent ')
    .replace(/\\text\{([^}]+)\}/g, '$1')
    .replace(/\\([a-zA-Z]+)/g, ' ') // Strip other backslash macros
    .replace(/[{}]/g, '') // Remove lingering curly braces
    // Markdown headers and bullets
    .replace(/^#+\s+/gm, '')
    .replace(/^[-*•]\s+/gm, '')
    // Bold, italic, code formatting
    .replace(/[*_`~]/g, '')
    // Multiple newlines or spaces to single space
    .replace(/\n+/g, '. ')
    .replace(/\s+/g, ' ')
    // Clean emojis (Unicode ranges)
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    .trim();

  return cleaned;
}

/**
 * Split long text into natural sentence chunks of ~160-200 characters max
 * to prevent Chromium speech synthesis timeout bug
 */
function splitIntoChunks(text: string, maxChunkLen = 180): string[] {
  if (text.length <= maxChunkLen) {
    return [text];
  }

  // Split on sentence boundaries: periods, questions, exclamations, commas, semicolons
  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    if (currentChunk.length + trimmed.length <= maxChunkLen) {
      currentChunk = currentChunk ? `${currentChunk} ${trimmed}` : trimmed;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk);
      }
      // If a single sentence is itself longer than maxChunkLen, split by commas or words
      if (trimmed.length > maxChunkLen) {
        const parts = trimmed.split(/,\s*/);
        let subChunk = '';
        for (const part of parts) {
          if (subChunk.length + part.length <= maxChunkLen) {
            subChunk = subChunk ? `${subChunk}, ${part}` : part;
          } else {
            if (subChunk) chunks.push(subChunk);
            subChunk = part;
          }
        }
        if (subChunk) chunks.push(subChunk);
        currentChunk = '';
      } else {
        currentChunk = trimmed;
      }
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks.length > 0 ? chunks : [text];
}

/**
 * Find best natural English voice from browser available voices
 */
export function getBestEnglishVoice(): SpeechSynthesisVoice | null {
  if (!isSpeechSynthesisSupported()) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // Prioritize high-quality natural English voices
  const preferred = voices.find(
    (v) =>
      v.lang.startsWith('en') &&
      (v.name.includes('Natural') ||
        v.name.includes('Google') ||
        v.name.includes('Samantha') ||
        v.name.includes('Jenny') ||
        v.name.includes('David') ||
        v.name.includes('Guy'))
  );
  if (preferred) return preferred;

  // Fallback to any English voice
  const anyEnglish = voices.find((v) => v.lang.startsWith('en'));
  if (anyEnglish) return anyEnglish;

  // Fallback to default or first voice
  return voices.find((v) => v.default) || voices[0] || null;
}

/**
 * Stop any active text-to-speech immediately
 */
export function stopSpeaking(): void {
  if (keepAliveTimer) {
    clearInterval(keepAliveTimer);
    keepAliveTimer = null;
  }

  if (isSpeechSynthesisSupported()) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }

  activeUtterance = null;
  textChunks = [];
  currentChunkIndex = 0;
  if (currentOptions?.onEnd) {
    try {
      currentOptions.onEnd();
    } catch {
      // ignore
    }
  }
  currentOptions = null;
}

/**
 * Check if speech synthesis is currently speaking
 */
export function isCurrentlySpeaking(): boolean {
  return isSpeechSynthesisSupported() && (window.speechSynthesis.speaking || window.speechSynthesis.pending);
}

/**
 * Internal recursive player for chunks
 */
function playNextChunk(): void {
  if (!isSpeechSynthesisSupported()) return;

  if (currentChunkIndex >= textChunks.length) {
    // All chunks spoken successfully
    stopSpeaking();
    return;
  }

  const chunkText = textChunks[currentChunkIndex];
  const utterance = new SpeechSynthesisUtterance(chunkText);
  activeUtterance = utterance; // Retain reference to prevent GC

  const voice = getBestEnglishVoice();
  if (voice) {
    utterance.voice = voice;
  }
  utterance.rate = currentOptions?.rate || 1.0;
  utterance.pitch = currentOptions?.pitch || 1.0;
  utterance.volume = currentOptions?.volume ?? 1.0;
  utterance.lang = currentOptions?.lang || 'en-US';

  utterance.onend = () => {
    currentChunkIndex++;
    playNextChunk();
  };

  utterance.onerror = (event: any) => {
    // Ignore canceled/interrupted events from intentional stopSpeaking()
    if (event.error === 'canceled' || event.error === 'interrupted') {
      return;
    }
    console.warn('TTS utterance error:', event.error);
    if (currentOptions?.onError) {
      currentOptions.onError(event);
    }
    stopSpeaking();
  };

  // Ensure speech synthesis is unpaused in Chrome
  try {
    window.speechSynthesis.resume();
  } catch {
    // ignore
  }

  window.speechSynthesis.speak(utterance);
}

/**
 * Speak text out loud with full error recovery, chunking, and keep-alive
 */
export function speakText(text: string, options?: SpeakOptions): void {
  if (!isSpeechSynthesisSupported()) {
    options?.onError?.('Speech synthesis not supported in this browser.');
    return;
  }

  // 1. Cancel previous speech cleanly
  stopSpeaking();

  const cleaned = cleanTextForSpeech(text);
  if (!cleaned) {
    options?.onEnd?.();
    return;
  }

  textChunks = splitIntoChunks(cleaned);
  currentChunkIndex = 0;
  currentOptions = options || {};

  // Notify start
  currentOptions.onStart?.();

  // 2. Start keep-alive timer for Chromium 15s pause bug
  keepAliveTimer = setInterval(() => {
    if (isSpeechSynthesisSupported()) {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      } else if (!window.speechSynthesis.pending) {
        clearInterval(keepAliveTimer);
        keepAliveTimer = null;
      }
    }
  }, 9000);

  // 3. Small delay (60ms) to allow Chromium async cancellation from stopSpeaking() to settle
  setTimeout(() => {
    // Load voices if not already cached
    try {
      window.speechSynthesis.getVoices();
    } catch {
      // ignore
    }
    playNextChunk();
  }, 60);
}

/**
 * Start Speech-To-Text voice listening
 */
export function startVoiceListening(options: ListenOptions): { stop: () => void } {
  const SpeechRecognition =
    typeof window !== 'undefined' &&
    ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  if (!SpeechRecognition) {
    options.onError?.('Voice recognition is not supported in this browser. Please use Google Chrome, Microsoft Edge, or Safari.');
    return { stop: () => {} };
  }

  // Stop any active session first
  stopVoiceListening();

  try {
    const recognition = new SpeechRecognition();
    activeRecognition = recognition;

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = options.lang || 'en-US';

    recognition.onstart = () => {
      options.onStart?.();
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = 0; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          finalTranscript += item[0].transcript;
        } else {
          interimTranscript += item[0].transcript;
        }
      }

      const currentText = (finalTranscript || interimTranscript).trim();
      const isFinal = Boolean(finalTranscript && !interimTranscript);
      if (currentText) {
        options.onResult(currentText, isFinal);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error event:', event.error);
      let message = 'Voice input encountered an error. Please try again.';

      if (event.error === 'not-allowed') {
        message = 'Microphone permission was denied. Please allow microphone access in your browser settings.';
      } else if (event.error === 'network') {
        message = 'Voice recognition network error. Please check your internet connection.';
      } else if (event.error === 'no-speech') {
        // No speech detected, graceful exit
        options.onEnd?.();
        return;
      } else if (event.error === 'audio-capture') {
        message = 'No microphone was found. Please ensure a microphone is connected.';
      }

      options.onError?.(message, event);
    };

    recognition.onend = () => {
      activeRecognition = null;
      options.onEnd?.();
    };

    recognition.start();

    return {
      stop: () => {
        try {
          recognition.stop();
        } catch {
          // ignore
        }
        activeRecognition = null;
      },
    };
  } catch (err: any) {
    console.warn('Failed to start speech recognition:', err);
    options.onError?.('Could not activate microphone. Please try again.', err);
    return { stop: () => {} };
  }
}

/**
 * Stop any active voice listening
 */
export function stopVoiceListening(): void {
  if (activeRecognition) {
    try {
      activeRecognition.stop();
    } catch {
      // ignore
    }
    activeRecognition = null;
  }
}
