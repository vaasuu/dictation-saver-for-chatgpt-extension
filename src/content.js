let recorder;
let chunks = [];
let stopTimer = null;

function startRecording() {
  console.log("Start recording");
  navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
    recorder = new MediaRecorder(stream);
    chunks = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      clearTimeout(stopTimer);
      const blob = new Blob(chunks, { type: "audio/webm" });

      // send ArrayBuffer + mime to background
      blob
        .arrayBuffer()
        .then((buffer) => {
          chrome.runtime.sendMessage({
            type: "SAVE_RECORDING",
            buffer, // ArrayBuffer
            mime: blob.type, // e.g. "audio/webm"
          });
        })
        .catch((err) => console.error("blob -> arrayBuffer failed:", err));
    };

    recorder.start();

    // stop after 10 minutes max (600,000 ms)
    stopTimer = setTimeout(() => {
      console.log("Auto-stopping after 10 minutes");
      stopRecording();
      const submitBtn = document.querySelector(
        'button[aria-label="Submit dictation"]'
      );
      if (submitBtn) submitBtn.click();
    }, 600_000);
  });
}

function stopRecording() {
  console.log("Stop recording");
  if (recorder && recorder.state !== "inactive") {
    recorder.stop();
  }
  recorder = null;
  clearTimeout(stopTimer);
  stopTimer = null;
}

function clearRecording() {
  console.log("Clear recording");
  chrome.runtime.sendMessage({ type: "CLEAR_RECORDING" });
}

// Attach listeners to ChatGPT’s buttons
function hookButtons() {
  console.log("Hook buttons");
  const dictateBtn = document.querySelector(
    'button[aria-label="Dictate button"]'
  );
  const stopBtn = document.querySelector('button[aria-label="Stop dictation"]');
  const submitBtn = document.querySelector(
    'button[aria-label="Submit dictation"]'
  );

  if (dictateBtn && !dictateBtn.dataset.hooked) {
    dictateBtn.addEventListener("click", startRecording);
    dictateBtn.dataset.hooked = "true";
  }

  if (stopBtn && !stopBtn.dataset.hooked) {
    stopBtn.addEventListener("click", () => {
      stopRecording();
      clearRecording();
    });
    stopBtn.dataset.hooked = "true";
  }

  if (submitBtn && !submitBtn.dataset.hooked) {
    submitBtn.addEventListener("click", stopRecording);
    submitBtn.dataset.hooked = "true";
  }
}

// Re-hook whenever DOM changes
const observer = new MutationObserver(hookButtons);
observer.observe(document.body, { childList: true, subtree: true });
hookButtons();
