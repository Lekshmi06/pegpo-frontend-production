import { preview } from 'vite';
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import path from 'node:path';
import mongoose from '../../Backend-vercel/node_modules/mongoose/index.js';
import jwt from '../../Backend-vercel/node_modules/jsonwebtoken/index.js';
import dotenv from '../../Backend-vercel/node_modules/dotenv/lib/main.js';

dotenv.config({ path: path.resolve('E:/pegpo-vercel/Backend-vercel/.env') });

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev_mode_only_minimum_32';
const MONGO_URI = process.env.MONGODB_URI;

async function runAudit() {
  console.log('======================================================================');
  console.log('  EDUPYE PHASE 4: REAL MULTI-BROWSER WEBRTC & MEDIA TRACK AUDIT       ');
  console.log('======================================================================\n');

  if (!MONGO_URI) throw new Error('MONGODB_URI missing');

  // 1. Connect to Mongo and seed test identities
  await mongoose.connect(MONGO_URI);
  console.log('✓ Connected to MongoDB.');

  const db = mongoose.connection.db;
  const timestamp = Date.now();

  const teacherId = new mongoose.Types.ObjectId();
  const studentId = new mongoose.Types.ObjectId();
  const unenrolledId = new mongoose.Types.ObjectId();
  const sessionId = new mongoose.Types.ObjectId();

  await db.collection('users').insertMany([
    {
      _id: teacherId,
      name: 'Dr. Richard Feynman',
      email: `feynman_${timestamp}@test.edu`,
      userType: 'teacher',
      roles: ['teacher'],
      activeRole: 'teacher',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: studentId,
      name: 'Ada Lovelace',
      email: `ada_${timestamp}@test.edu`,
      userType: 'student',
      roles: ['student'],
      activeRole: 'student',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: unenrolledId,
      name: 'Unenrolled Hacker',
      email: `hacker_${timestamp}@test.edu`,
      userType: 'student',
      roles: ['student'],
      activeRole: 'student',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  await db.collection('liveclasssessions').insertOne({
    _id: sessionId,
    title: 'Quantum Electrodynamics Live Lecture',
    hostId: teacherId,
    hostRole: 'teacher',
    status: 'live',
    sessionType: 'smartboard_ad_hoc',
    authorizedStudentIds: [studentId],
    activeParticipants: [],
    settings: {
      allowMicrophone: true,
      allowCamera: true,
      allowScreenShare: true,
      allowChat: true,
    },
    startedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log(`✓ Seeded LiveClassSession: ${sessionId.toString()}`);

  const teacherToken = jwt.sign(
    { userId: teacherId.toString(), name: 'Dr. Richard Feynman', role: 'teacher' },
    JWT_SECRET,
    { expiresIn: '2h' }
  );

  const studentToken = jwt.sign(
    { userId: studentId.toString(), name: 'Ada Lovelace', role: 'student' },
    JWT_SECRET,
    { expiresIn: '2h' }
  );

  const unenrolledToken = jwt.sign(
    { userId: unenrolledId.toString(), name: 'Unenrolled Hacker', role: 'student' },
    JWT_SECRET,
    { expiresIn: '2h' }
  );

  // 2. Check or Start Backend Server on Port 5000
  let backendProc = null;
  let isPort5000Up = false;
  try {
    const res = await fetch('http://localhost:5000');
    isPort5000Up = true;
    console.log('✓ Backend Signalling Server already running on port 5000.');
  } catch (e) {
    isPort5000Up = false;
  }

  if (!isPort5000Up) {
    console.log('\n[Backend Server] Spawning Express + WebSocket signalling server...');
    backendProc = spawn(
      'cmd.exe',
      ['/c', 'set PATH=C:\\nvm4w\\nodejs;%PATH% && npx tsx src/server.ts'],
      {
        cwd: 'E:/pegpo-vercel/Backend-vercel',
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, PORT: '5000' },
      }
    );
    await new Promise((resolve) => setTimeout(resolve, 4000));
  }
  console.log('✓ Backend Signalling Server active on port 5000.');

  // 3. Start Vite Preview on Port 4199
  const frontendRoot = path.resolve('E:/pegpo-vercel/Frontend-vercel');
  const server = await preview({
    root: frontendRoot,
    preview: {
      port: 4199,
      strictPort: true,
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        },
      },
    },
  });
  const baseURL = `http://localhost:4199`;
  console.log(`✓ Frontend Preview active on: ${baseURL}`);

  // 4. Launch Browser with Synthetic Camera & Microphone Flags
  console.log('\n[Browser Engine] Launching Chromium (msedge/chrome) with real synthetic media devices...');
  let browser;
  for (const channel of ['msedge', 'chrome']) {
    try {
      browser = await chromium.launch({
        channel,
        headless: true,
        args: [
          '--use-fake-ui-for-media-stream',
          '--use-fake-device-for-media-stream',
          '--allow-file-access-from-files',
        ],
      });
      console.log(`[Browser Engine] Launched native browser: ${channel}`);
      break;
    } catch (e) {
      console.warn(`Channel ${channel} failed:`, e.message);
    }
  }
  if (!browser) throw new Error('No compatible browser installed');

  let testsPassed = 0;
  let testsFailed = 0;

  async function testStep(name, fn) {
    process.stdout.write(`[Audit] ${name} ... `);
    try {
      await fn();
      console.log('PASS');
      testsPassed++;
    } catch (err) {
      console.log(`FAIL\n  Error: ${err.message}`);
      testsFailed++;
    }
  }

  let teacherContext;
  let studentContext;
  let teacherPage;
  let studentPage;

  try {
    // -----------------------------------------------------------------
    // Step 1: Teacher joins session with real media tracks
    // -----------------------------------------------------------------
    await testStep('Teacher connects with active synthetic Audio & Video tracks', async () => {
      teacherContext = await browser.newContext({
        permissions: ['camera', 'microphone'],
      });
      teacherPage = await teacherContext.newPage();
      teacherPage.on('console', (msg) => console.log(`[Teacher Console] ${msg.type()}: ${msg.text()}`));
      teacherPage.on('pageerror', (err) => console.log(`[Teacher PageError]`, err.message));

      await teacherPage.goto(`${baseURL}/login`);
      await teacherPage.evaluate(
        ({ token, id }) => {
          localStorage.setItem('token', token);
          localStorage.setItem('auth_token', token);
          localStorage.setItem(
            'user',
            JSON.stringify({
              _id: id,
              id,
              name: 'Dr. Richard Feynman',
              role: 'teacher',
              userType: 'teacher',
            })
          );
        },
        { token: teacherToken, id: teacherId.toString() }
      );

      await teacherPage.goto(`${baseURL}/live/${sessionId.toString()}`);
      await teacherPage.waitForLoadState('domcontentloaded');
      await teacherPage.waitForTimeout(1500);

      // Verify that local video/audio tracks exist and are live
      const localMediaStatus = await teacherPage.evaluate(async () => {
        // Find local video element
        const vids = Array.from(document.querySelectorAll('video'));
        const localVid = vids.find((v) => v.muted);
        if (!localVid || !localVid.srcObject) return { ok: false, reason: 'No local video srcObject' };
        const stream = localVid.srcObject;
        const tracks = stream.getTracks();
        const aTrack = tracks.find((t) => t.kind === 'audio');
        const vTrack = tracks.find((t) => t.kind === 'video');

        return {
          ok: Boolean(aTrack && vTrack),
          audioState: aTrack?.readyState,
          audioEnabled: aTrack?.enabled,
          videoState: vTrack?.readyState,
          videoEnabled: vTrack?.enabled,
        };
      });

      if (!localMediaStatus.ok) {
        throw new Error(`Teacher local media not capturing: ${JSON.stringify(localMediaStatus)}`);
      }
      if (localMediaStatus.audioState !== 'live' || localMediaStatus.videoState !== 'live') {
        throw new Error(`Media tracks not live: ${JSON.stringify(localMediaStatus)}`);
      }
    });

    // -----------------------------------------------------------------
    // Step 2: Student joins session with active media tracks
    // -----------------------------------------------------------------
    await testStep('Student connects with active synthetic Audio & Video tracks', async () => {
      studentContext = await browser.newContext({
        permissions: ['camera', 'microphone'],
      });
      studentPage = await studentContext.newPage();
      studentPage.on('console', (msg) => console.log(`[Student Console] ${msg.type()}: ${msg.text()}`));
      studentPage.on('pageerror', (err) => console.log(`[Student PageError]`, err.message));

      await studentPage.goto(`${baseURL}/login`);
      await studentPage.evaluate(
        ({ token, id }) => {
          localStorage.setItem('token', token);
          localStorage.setItem('auth_token', token);
          localStorage.setItem(
            'user',
            JSON.stringify({
              _id: id,
              id,
              name: 'Ada Lovelace',
              role: 'student',
              userType: 'student',
            })
          );
        },
        { token: studentToken, id: studentId.toString() }
      );

      await studentPage.goto(`${baseURL}/live/${sessionId.toString()}`);
      await studentPage.waitForLoadState('domcontentloaded');
      await studentPage.waitForTimeout(2000);

      const localMediaStatus = await studentPage.evaluate(async () => {
        const vids = Array.from(document.querySelectorAll('video'));
        const localVid = vids.find((v) => v.muted);
        if (!localVid || !localVid.srcObject) return { ok: false, reason: 'No local video srcObject' };
        const stream = localVid.srcObject;
        const tracks = stream.getTracks();
        const aTrack = tracks.find((t) => t.kind === 'audio');
        const vTrack = tracks.find((t) => t.kind === 'video');

        return {
          ok: Boolean(aTrack && vTrack),
          audioState: aTrack?.readyState,
          videoState: vTrack?.readyState,
        };
      });

      if (!localMediaStatus.ok) {
        throw new Error(`Student local media not capturing: ${JSON.stringify(localMediaStatus)}`);
      }
    });

    // -----------------------------------------------------------------
    // Step 3: Peer-to-Peer WebRTC Media Exchange Verification
    // -----------------------------------------------------------------
    await testStep('Teacher receives Student remote video and audio streams via WebRTC', async () => {
      // Wait for remote video feed on teacher's page
      let remoteReceived = false;
      for (let i = 0; i < 20; i++) {
        await teacherPage.waitForTimeout(500);
        remoteReceived = await teacherPage.evaluate(() => {
          const vids = Array.from(document.querySelectorAll('video'));
          // Remote video is NOT muted
          const remoteVid = vids.find((v) => !v.muted && v.srcObject);
          if (!remoteVid) return false;
          const stream = remoteVid.srcObject;
          const tracks = stream.getTracks();
          const hasLiveTracks = tracks.some((t) => t.readyState === 'live');
          return Boolean(hasLiveTracks);
        });
        if (remoteReceived) break;
      }

      if (!remoteReceived) {
        throw new Error('Teacher page did not receive remote audio/video stream from Student within 10s');
      }
    });

    await testStep('Student receives Teacher remote video and audio streams via WebRTC', async () => {
      let remoteReceived = false;
      for (let i = 0; i < 20; i++) {
        await studentPage.waitForTimeout(500);
        remoteReceived = await studentPage.evaluate(() => {
          const vids = Array.from(document.querySelectorAll('video'));
          const remoteVid = vids.find((v) => !v.muted && v.srcObject);
          if (!remoteVid) return false;
          const stream = remoteVid.srcObject;
          const tracks = stream.getTracks();
          return tracks.some((t) => t.readyState === 'live');
        });
        if (remoteReceived) break;
      }

      if (!remoteReceived) {
        throw new Error('Student page did not receive remote audio/video stream from Teacher within 10s');
      }
    });

    // -----------------------------------------------------------------
    // Step 4: Microphone mute & camera disable propagation
    // -----------------------------------------------------------------
    await testStep('Microphone mute toggles track enabled state and propagates to remote peer', async () => {
      // Teacher clicks mic button to mute
      await teacherPage.locator('button[title*="Microphone"]').first().click();
      await teacherPage.waitForTimeout(800);

      // Check on teacher page: local audio track disabled
      const teacherMicDisabled = await teacherPage.evaluate(() => {
        const vids = Array.from(document.querySelectorAll('video'));
        const localVid = vids.find((v) => v.muted);
        const stream = localVid?.srcObject;
        const aTrack = stream?.getAudioTracks()[0];
        return aTrack ? aTrack.enabled === false : false;
      });
      if (!teacherMicDisabled) {
        throw new Error('Teacher local audio track was not disabled on mute');
      }

      // Check on student page: teacher's card shows muted icon
      const studentSawMute = await studentPage.evaluate(() => {
        const titleElements = Array.from(document.querySelectorAll('[title="Muted"]'));
        return titleElements.length > 0;
      });
      if (!studentSawMute) {
        throw new Error('Remote peer did not receive media-state-change mic mute');
      }

      // Teacher unmutes mic
      await teacherPage.locator('button[title*="Microphone"]').first().click();
      await teacherPage.waitForTimeout(500);
    });

    // -----------------------------------------------------------------
    // Step 5: Real-Time In-Class Chat Message Delivery
    // -----------------------------------------------------------------
    await testStep('Real-time chat messages exchange across peers with sender attribution', async () => {
      // Student opens chat drawer
      await studentPage.locator('button[title="Classroom Chat"]').first().click();
      await studentPage.waitForTimeout(400);

      // Student sends a message
      const chatInput = studentPage.locator('input[placeholder="Type message to class..."]').first();
      await chatInput.fill('Question regarding quantum tunneling: does amplitude decay exponentially?');
      await chatInput.press('Enter');
      await studentPage.waitForTimeout(800);

      // Teacher opens chat drawer
      await teacherPage.locator('button[title="Classroom Chat"]').first().click();
      await teacherPage.waitForTimeout(600);

      // Verify message appears in teacher's chat drawer
      const teacherSawMessage = await teacherPage.evaluate(() => {
        return document.body.innerText.includes('quantum tunneling: does amplitude decay exponentially');
      });
      if (!teacherSawMessage) {
        throw new Error('Teacher chat drawer did not receive message from Student');
      }
    });

    // -----------------------------------------------------------------
    // Step 6: Unauthorized access rejection
    // -----------------------------------------------------------------
    await testStep('Unauthorized unenrolled user is strictly blocked from live session', async () => {
      const hackerContext = await browser.newContext();
      const hackerPage = await hackerContext.newPage();

      await hackerPage.goto(`${baseURL}/login`);
      await hackerPage.evaluate(
        ({ token, id }) => {
          localStorage.setItem('token', token);
          localStorage.setItem('auth_token', token);
          localStorage.setItem(
            'user',
            JSON.stringify({
              _id: id,
              id,
              name: 'Unenrolled Hacker',
              role: 'student',
              userType: 'student',
            })
          );
        },
        { token: unenrolledToken, id: unenrolledId.toString() }
      );

      await hackerPage.goto(`${baseURL}/live/${sessionId.toString()}`);
      await hackerPage.waitForTimeout(1500);

      const isBlocked = await hackerPage.evaluate(() => {
        return (
          document.body.innerText.includes('Classroom Not Found') ||
          document.body.innerText.includes('Access denied') ||
          document.body.innerText.includes('Unauthorized') ||
          document.body.innerText.includes('enrolled')
        );
      });

      if (!isBlocked) {
        throw new Error('Unenrolled student was not rejected from live classroom');
      }
      await hackerContext.close();
    });

    // -----------------------------------------------------------------
    // Step 7: Host terminates live classroom session for all
    // -----------------------------------------------------------------
    await testStep('Host terminates live session: all peers receive Concluded screen and disconnect', async () => {
      // Teacher clicks End Class button
      const endBtn = teacherPage.locator('button:has-text("End Class")').first();
      if (await endBtn.isVisible()) {
        await endBtn.click();
        await teacherPage.waitForTimeout(300);

        // Confirm in modal
        const confirmBtn = teacherPage.locator('div[role="dialog"] button:has-text("End Class"), div.bg-slate-900 button:has-text("End Class")').last();
        await confirmBtn.click();
      }

      await studentPage.waitForTimeout(1500);

      // Verify student view transitions to "Class Concluded"
      const studentClassEnded = await studentPage.evaluate(() => {
        return (
          document.body.innerText.includes('Class Concluded') ||
          document.body.innerText.includes('concluded this live classroom')
        );
      });

      if (!studentClassEnded) {
        throw new Error('Student did not receive session-ended signal or concluded view');
      }
    });

  } finally {
    if (teacherContext) await teacherContext.close();
    if (studentContext) await studentContext.close();
    await browser.close();
    await server.close();

    // Kill backend process if we spawned it
    if (backendProc) {
      backendProc.kill('SIGINT');
    }

    // Cleanup MongoDB test records
    await db.collection('liveclasssessions').deleteMany({ _id: sessionId });
    await db.collection('users').deleteMany({ _id: { $in: [teacherId, studentId, unenrolledId] } });
    await mongoose.disconnect();
    console.log('\n✓ MongoDB test records cleaned up & disconnected.');
  }

  console.log('\n======================================================================');
  console.log(`  REAL WEBRTC MULTI-BROWSER AUDIT: ${testsPassed} PASSED, ${testsFailed} FAILED`);
  console.log('======================================================================\n');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runAudit().catch((err) => {
  console.error('Fatal audit failure:', err);
  process.exit(1);
});
