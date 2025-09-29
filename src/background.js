/** @type {Array<{data: number[], mime: string, timestamp: number, duration: number}>} */
let recordings = [];
const MAX_RECORDINGS = 2;
const STORAGE_KEY = "recordings";

/**
 * Loads recordings from chrome.storage.local
 * @returns {Promise<void>}
 */
async function loadRecordings() {
  try {
    const result = await chrome.storage.local.get([STORAGE_KEY]);
    recordings = result[STORAGE_KEY] || [];
    console.log(`Loaded ${recordings.length} recordings from storage`);
  } catch (error) {
    console.error("Failed to load recordings from storage:", error);
    recordings = [];
  }
}

/**
 * Saves recordings to chrome.storage.local
 * @returns {Promise<void>}
 */
async function saveRecordings() {
  try {
    await chrome.storage.local.set({ [STORAGE_KEY]: recordings });
    console.log(`Saved ${recordings.length} recordings to storage`);
  } catch (error) {
    console.error("Failed to save recordings to storage:", error);

    // If quota exceeded, remove oldest recordings until it fits
    if (error.message && error.message.includes("quota exceeded")) {
      console.log("Storage quota exceeded, removing oldest recordings...");
      while (recordings.length > 0) {
        recordings.pop(); // Remove oldest (last in array)
        try {
          await chrome.storage.local.set({ [STORAGE_KEY]: recordings });
          console.log(`Saved ${recordings.length} recordings after removing old ones`);
          break;
        } catch (retryError) {
          if (!(retryError.message && retryError.message.includes("quota exceeded"))) {
            console.error("Failed to save after removing recordings:", retryError);
            break;
          }
        }
      }
    }
  }
}

/**
 * Clears all recordings from storage
 * @returns {Promise<void>}
 */
async function clearRecordings() {
  try {
    await chrome.storage.local.remove([STORAGE_KEY]);
    recordings = [];
    console.log("Cleared all recordings from storage");
  } catch (error) {
    console.error("Failed to clear recordings from storage:", error);
  }
}

// Initialize recordings on startup
loadRecordings();

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    try {
      if (msg.type === "SAVE_RECORDING") {
        // Add new recording and maintain only the last MAX_RECORDINGS
        recordings.unshift({
          data: msg.data,
          mime: msg.mime,
          timestamp: msg.timestamp,
          duration: msg.duration || 0,
        });

        if (recordings.length > MAX_RECORDINGS) {
          recordings.pop();
        }

        await saveRecordings();
        sendResponse({ ok: true });
      } else if (msg.type === "CLEAR_RECORDINGS") {
        await clearRecordings();
        sendResponse({ ok: true });
      } else if (msg.type === "GET_RECORDINGS") {
        sendResponse({
          ok: true,
          recordings: recordings,
        });
      } else if (msg.type === "GET_RECORDING") {
        const index = msg.index || 0;
        if (recordings[index]) {
          sendResponse({
            ok: true,
            ...recordings[index],
          });
        } else {
          sendResponse({ ok: false });
        }
      }
    } catch (error) {
      console.error("Error handling message:", error);
      sendResponse({ ok: false, error: error.message });
    }
  })();

  return true;
});
