document.getElementById("download").addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "GET_RECORDING" }, (blob) => {
    if (!blob) {
      alert("No recording available.");
      return;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "chatgpt-recording.webm";
    a.click();
  });
});
