/**
 * Formats a duration in milliseconds to a readable string
 */
function formatDuration(duration: number): string {
  const seconds = Math.floor(duration / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

/**
 * Downloads a recording
 */
function downloadRecording(index: number): void {
  chrome.runtime.sendMessage({ type: "GET_RECORDING", index }, (response: any) => {
    if (chrome.runtime.lastError) {
      alert("Error: " + chrome.runtime.lastError.message);
      return;
    }

    if (!response || !response.ok) {
      alert("Recording not available.");
      return;
    }

    try {
      const uint8 = new Uint8Array(response.data);
      const blob = new Blob([uint8.buffer], {
        type: response.mime || "audio/webm",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const date = new Date(response.timestamp);
      const dateStr = date.toISOString().replace(/[:]/g, "-").slice(0, 19);
      a.download = `chatgpt-recording-${dateStr}.webm`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to reconstruct recording: " + err);
    }
  });
}

/**
 * Updates the recordings list in the UI
 */
let currentAudio: HTMLAudioElement | null = null;

function playRecording(index: number): void {
  // Stop any currently playing audio
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }

  chrome.runtime.sendMessage({ type: "GET_RECORDING", index }, (response: any) => {
    if (!response || !response.ok) {
      alert("Recording not available.");
      return;
    }

    try {
      const uint8 = new Uint8Array(response.data);
      const blob = new Blob([uint8.buffer], {
        type: response.mime || "audio/webm",
      });

      const url = URL.createObjectURL(blob);
      currentAudio = new Audio(url);

      currentAudio.onended = () => {
        URL.revokeObjectURL(url);
        currentAudio = null;
        // Update play button state
        const playBtn = document.querySelector(
          `button[data-play-index="${index}"]`
        ) as HTMLButtonElement | null;
        if (playBtn) {
          playBtn.innerHTML = "▶️";
        }
      };

      currentAudio.onpause = () => {
        const playBtn = document.querySelector(
          `button[data-play-index="${index}"]`
        ) as HTMLButtonElement | null;
        if (playBtn) {
          playBtn.innerHTML = "▶️";
        }
      };

      currentAudio.onplay = () => {
        const playBtn = document.querySelector(
          `button[data-play-index="${index}"]`
        ) as HTMLButtonElement | null;
        if (playBtn) {
          playBtn.innerHTML = "⏸️";
        }
      };

      currentAudio.onpause = () => {
        const playBtn = document.querySelector(
          `button[data-play-index="${index}"]`
        ) as HTMLButtonElement | null;
        if (playBtn) {
          playBtn.innerHTML = "▶️";
        }
      };

      currentAudio.onplay = () => {
        const playBtn = document.querySelector(
          `button[data-play-index="${index}"]`
        ) as HTMLButtonElement | null;
        if (playBtn) {
          playBtn.innerHTML = "⏸️";
        }
      };

      currentAudio.play().catch((err) => {
        alert("Failed to play recording: " + err);
      });
    } catch (err) {
      alert("Failed to play recording: " + err);
    }
  });
}

function updateRecordingsList(): void {
  chrome.runtime.sendMessage({ type: "GET_RECORDINGS" }, (response: any) => {
    if (!response || !response.ok || !response.recordings) {
      document.getElementById("recordings-list").innerHTML = `
        <tr>
          <td colspan="4" class="no-recordings">No recordings available</td>
        </tr>
      `;
      return;
    }

    const recordings = response.recordings;
    const tbody = document.getElementById("recordings-list")!;
    tbody.innerHTML = recordings
      .map((recording: any, index: number) => {
        const date = new Date(recording.timestamp);
        const formattedDate = date.toLocaleString();
        const duration = recording.duration
          ? formatDuration(recording.duration)
          : "-";

        return `
        <tr>
          <td>${formattedDate}</td>
          <td>${duration}</td>
          <td>
            <button class="play-btn" data-play-index="${index}">▶️</button>
            <button class="download-btn" data-index="${index}">
              💾
            </button>
          </td>
        </tr>
      `;
      })
      .join("");
  });
}

// Initialize the recordings list
document.addEventListener("DOMContentLoaded", (): void => {
  updateRecordingsList();

  // Add click handler for download buttons
  document.getElementById("recordings-list")!.addEventListener("click", (e: Event): void => {
    const target = e.target as HTMLElement;
    const index = parseInt(
      target.dataset.index || target.dataset.playIndex || ""
    );
    if (!isNaN(index)) {
      if (target.classList.contains("download-btn")) {
        downloadRecording(index);
      } else if (target.classList.contains("play-btn")) {
        if (currentAudio && target.innerHTML === "⏸️") {
          currentAudio.pause();
        } else {
          playRecording(index);
        }
      }
    }
  });
});
