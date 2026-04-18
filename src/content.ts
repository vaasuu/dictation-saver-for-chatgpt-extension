let recorder: MediaRecorder | null = null;
let mediaStream: MediaStream | null = null;
let chunks: Blob[] = [];
let stopTimer: number | null = null;
let startTime: number | null = null;
let isCanceling = false;

function stopAllMediaTracks(): void {
  console.log('stopAllMediaTracks called, mediaStream:', mediaStream);
  if (mediaStream) {
    console.log('Stopping tracks, count:', mediaStream.getTracks().length);
    mediaStream.getTracks().forEach((track) => {
      console.log('Stopping track:', track.kind, track.readyState);
      track.stop();
    });
    mediaStream = null;
    console.log('mediaStream set to null');
  }
}

/**
 * Starts recording audio from the user's microphone
 */
async function startRecording(): Promise<void> {
  console.log('Starting audio recording...');

  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recorder = new MediaRecorder(mediaStream);
    chunks = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    // Set start time before initializing recorder events
    startTime = Date.now();
    const recordingStartTime = startTime; // Capture the start time in closure

    recorder.onstop = async () => {
      console.log(
        'onstop fired, isCanceling:',
        isCanceling,
        'chunks length:',
        chunks.length
      );
      if (stopTimer !== null) clearTimeout(stopTimer);
      if (isCanceling) {
        console.log('Recording canceled, not saving');
        isCanceling = false;
        return;
      }
      const blob = new Blob(chunks, { type: 'audio/webm' });

      try {
        const buffer = await blob.arrayBuffer();
        const uint8 = new Uint8Array(buffer);

        // Use the captured start time instead of the global variable
        const duration = Date.now() - recordingStartTime;

        chrome.runtime.sendMessage({
          type: 'SAVE_RECORDING',
          data: Array.from(uint8),
          mime: blob.type || 'audio/webm',
          timestamp: recordingStartTime,
          duration: duration,
        });
      } catch (error) {
        console.error('Failed to process recording:', error);
      }
    };

    recorder.start();

    // Auto-stop after 10 minutes (600,000 ms)
    stopTimer = setTimeout(() => {
      console.log('Auto-stopping recording after 10 minutes');
      stopRecording();
      const submitBtn = document.querySelector(
        'button[aria-label="Submit dictation"]'
      ) as HTMLButtonElement | null;
      if (submitBtn) submitBtn.click();
    }, 600_000);
  } catch (error) {
    console.error('Failed to start recording:', error);
    throw error;
  }
}

/**
 * Stops the current recording
 */
function stopRecording() {
  console.log(
    'stopRecording called, recorder state:',
    recorder?.state,
    'mediaStream:',
    mediaStream ? 'exists' : null
  );
  isCanceling = false;
  if (recorder && recorder.state !== 'inactive') {
    console.log('Calling recorder.stop()');
    recorder.stop();
  }
  console.log('Calling stopAllMediaTracks from stopRecording');
  stopAllMediaTracks();
  recorder = null;
  startTime = null;
  if (stopTimer !== null) clearTimeout(stopTimer);
  stopTimer = null;
}

/**
 * Cancels the current recording without saving
 */
function cancelRecording(): void {
  console.log(
    'cancelRecording called, recorder state:',
    recorder?.state,
    'mediaStream:',
    mediaStream ? 'exists' : null
  );
  isCanceling = true;
  if (mediaStream) {
    console.log('Calling stopAllMediaTracks from cancelRecording');
    stopAllMediaTracks();
  }
  if (recorder && recorder.state !== 'inactive') {
    console.log('Calling recorder.stop()');
    recorder.stop();
  }
  recorder = null;
  startTime = null;
  chunks = [];
  if (stopTimer !== null) clearTimeout(stopTimer);
  stopTimer = null;

  // Debug: check if there are any other active streams
  navigator.mediaDevices.enumerateDevices().then((devices) => {
    const mics = devices.filter((d) => d.kind === 'audioinput');
    console.log('Available microphones after cancel:', mics.length);
  });
}

// Attach listeners to ChatGPT's buttons
function hookButtons(): void {
  console.log('Hook buttons');
  const dictateBtn =
    document.querySelector('button[aria-label="Dictate button"]') ||
    (document.querySelector(
      'button[aria-label="Start dictation"]'
    ) as HTMLElement | null);
  const stopBtn =
    document.querySelector('button[aria-label="Stop dictation"]') ||
    (document.querySelector(
      'button[aria-label="Cancel dictation"]'
    ) as HTMLElement | null);
  const submitBtn = document.querySelector(
    'button[aria-label="Submit dictation"]'
  ) as HTMLButtonElement | null;

  console.log(
    'Button states - dictateBtn:',
    !!dictateBtn,
    'stopBtn:',
    !!stopBtn,
    'submitBtn:',
    !!submitBtn
  );

  if (dictateBtn && !dictateBtn.dataset.hooked) {
    console.log('Attaching startRecording to dictateBtn');
    dictateBtn.addEventListener('click', startRecording);
    dictateBtn.dataset.hooked = 'true';
  }

  if (stopBtn && !stopBtn.dataset.hooked) {
    console.log('Attaching cancelRecording to stopBtn');
    stopBtn.addEventListener('click', cancelRecording);
    stopBtn.dataset.hooked = 'true';
  }

  if (submitBtn && !submitBtn.dataset.hooked) {
    console.log('Attaching stopRecording to submitBtn');
    submitBtn.addEventListener('click', stopRecording);
    submitBtn.dataset.hooked = 'true';
  }
}

// Re-hook whenever DOM changes
const observer = new MutationObserver(hookButtons);
observer.observe(document.body, { childList: true, subtree: true });
hookButtons();
