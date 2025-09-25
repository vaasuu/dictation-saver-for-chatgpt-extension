let lastRecording = null;

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "SAVE_RECORDING") {
    lastRecording = new Blob([msg.buffer], { type: "audio/webm" });
    console.log("Recording saved:", lastRecording);
  }
  if (msg.type === "CLEAR_RECORDING") {
    lastRecording = null;
    console.log("Recording cleared");
  }
  if (msg.type === "GET_RECORDING") {
    sendResponse(lastRecording);
  }
});
