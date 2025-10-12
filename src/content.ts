let recorder: MediaRecorder | null = null;
let chunks: Blob[] = [];
let stopTimer: number | null = null;
let startTime: number | null = null;

/**
 * Starts recording audio from the user's microphone
 */
async function startRecording(): Promise<void> {
  console.log('Starting audio recording...');

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recorder = new MediaRecorder(stream);
    chunks = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    // Set start time before initializing recorder events
    startTime = Date.now();
    const recordingStartTime = startTime; // Capture the start time in closure

    recorder.onstop = async () => {
      clearTimeout(stopTimer);
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
      );
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
  console.log('Stopping recording...');
  if (recorder && recorder.state !== 'inactive') {
    recorder.stop();
  }
  recorder = null;
  startTime = null;
  clearTimeout(stopTimer);
  stopTimer = null;
}

function clearRecording(): void {
  console.log('Clear recording');
  chrome.runtime.sendMessage({ type: 'CLEAR_RECORDING' });
}

// Attach listeners to ChatGPT’s buttons
function hookButtons(): void {
  console.log('Hook buttons');
  const dictateBtn = document.querySelector(
    'button[aria-label="Dictate button"]'
  );
  const stopBtn = document.querySelector('button[aria-label="Stop dictation"]');
  const submitBtn = document.querySelector(
    'button[aria-label="Submit dictation"]'
  );

  if (dictateBtn && !dictateBtn.dataset.hooked) {
    dictateBtn.addEventListener('click', startRecording);
    dictateBtn.dataset.hooked = 'true';
  }

  if (stopBtn && !stopBtn.dataset.hooked) {
    stopBtn.addEventListener('click', () => {
      stopRecording();
      clearRecording();
    });
    stopBtn.dataset.hooked = 'true';
  }

  if (submitBtn && !submitBtn.dataset.hooked) {
    submitBtn.addEventListener('click', stopRecording);
    submitBtn.dataset.hooked = 'true';
  }
}

// Re-hook whenever DOM changes
const observer = new MutationObserver(hookButtons);
observer.observe(document.body, { childList: true, subtree: true });
hookButtons();
