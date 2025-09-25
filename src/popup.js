document.getElementById("download").addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "GET_RECORDING" }, (response) => {
    if (chrome.runtime.lastError) {
      alert("Error: " + chrome.runtime.lastError.message);
      return;
    }

    if (!response || !response.ok) {
      alert("No recording available.");
      return;
    }

    try {
      const uint8 = new Uint8Array(response.data); // restore bytes
      const blob = new Blob([uint8.buffer], {
        type: response.mime || "audio/webm",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `chatgpt-recording-${Date.now()}.webm`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to reconstruct blob: " + err);
    }
  });
});
