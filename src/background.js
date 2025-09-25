/** @type {Array<{data: number[], mime: string, timestamp: number, duration: number}>} */
const recordings = [];
const MAX_RECORDINGS = 3;

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
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

    sendResponse({ ok: true });
  } else if (msg.type === "CLEAR_RECORDINGS") {
    recordings.length = 0;
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
  return true;
});
