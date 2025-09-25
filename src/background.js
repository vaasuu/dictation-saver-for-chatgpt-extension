let lastBuffer = null;
let lastMime = null;

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "SAVE_RECORDING") {
    lastBuffer = msg.buffer; // ArrayBuffer
    lastMime = msg.mime;
    console.log("Saved buffer length:", lastBuffer.byteLength);
    return;
  }

  if (msg.type === "CLEAR_RECORDING") {
    lastBuffer = null;
    lastMime = null;
    return;
  }

  if (msg.type === "GET_RECORDING") {
    if (!lastBuffer) {
      sendResponse({ ok: false });
      return;
    }
    // send back raw ArrayBuffer and mime
    sendResponse({ ok: true, buffer: lastBuffer, mime: lastMime });
    return;
  }
});
