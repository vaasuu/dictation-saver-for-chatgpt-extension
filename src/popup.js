document.getElementById("download").addEventListener("click", () => {
  console.log("Clicked download recording");
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
    console.log("Tried to download a recording");
  });
});
