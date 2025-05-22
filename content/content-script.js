console.log("Content script loaded.");

chrome.runtime.sendMessage({ type: "GREET" }, (response) => {
  console.log(response.reply);
});
