let lastRecording = null;

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "SAVE_RECORDING") {
    lastRecording = {
      data: msg.data,
      mime: msg.mime,
    };
    sendResponse({ ok: true });
  } else if (msg.type === "CLEAR_RECORDING") {
    lastRecording = null;
    sendResponse({ ok: true });
  } else if (msg.type === "GET_RECORDING") {
    if (lastRecording) {
      sendResponse({
        ok: true,
        data: lastRecording.data,
        mime: lastRecording.mime,
      });
    } else {
      sendResponse({ ok: false });
    }
  }
  return true;
});
