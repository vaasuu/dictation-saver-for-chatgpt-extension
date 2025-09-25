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
      // response.buffer is an ArrayBuffer
      const blob = new Blob([response.buffer], {
        type: response.mime || "audio/webm",
      });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "chatgpt-recording.webm";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to reconstruct blob: " + err);
    }
  });
});
