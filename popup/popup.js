document.getElementById("btn").addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "GREET" }, (response) => {
      alert(response.reply);
    });
  });
  