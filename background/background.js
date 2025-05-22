chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed!");
  });
  
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "GREET") {
      sendResponse({ reply: "Hello from background!" });
    }
  });
  