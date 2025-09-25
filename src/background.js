// background.js
let lastRecording = null; // { buffer: ArrayBuffer, mime: string } or null

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "SAVE_RECORDING") {
    // save the ArrayBuffer + mime, do NOT try to convert to a Blob here
    lastRecording = { buffer: msg.buffer, mime: msg.mime || "audio/webm" };
    console.log("Saved recording (bytes):", lastRecording.buffer?.byteLength);
    return; // no response needed
  }

  if (msg.type === "CLEAR_RECORDING") {
    lastRecording = null;
    console.log("Cleared recording");
    return;
  }

  if (msg.type === "GET_RECORDING") {
    if (!lastRecording) {
      sendResponse({ ok: false });
      return;
    }
    // Return the stored ArrayBuffer + mime. Structured clone will copy the ArrayBuffer.
    sendResponse({
      ok: true,
      buffer: lastRecording.buffer,
      mime: lastRecording.mime,
    });
    return;
  }
});
