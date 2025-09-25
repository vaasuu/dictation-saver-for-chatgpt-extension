document.getElementById("download").addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "GET_RECORDING" }, (response) => {
    // check for runtime errors
    if (chrome.runtime.lastError) {
      console.error("runtime.lastError:", chrome.runtime.lastError);
      alert("Extension error: " + chrome.runtime.lastError.message);
      return;
    }

    if (!response || !response.ok) {
      alert("No recording available.");
      return;
    }

    try {
      const blob = new Blob([response.buffer], {
        type: response.mime || "audio/webm",
      });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "chatgpt-recording.webm";
      // append+click pattern to work reliably in popup
      document.body.appendChild(a);
      a.click();
      a.remove();

      // free the object URL as soon as we don't need it
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to create/download blob:", err);
      alert("Failed to reconstruct recording: " + err);
    }
  });
});
