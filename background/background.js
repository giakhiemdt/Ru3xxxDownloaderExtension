chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  
    if (message.type === "DOWNLOAD_IMAGES") {
      const urls = message.images;
      urls.forEach((url, index) => {
        const extension = url.split('.').pop().split('?')[0] || "png";
        chrome.downloads.download({
          url: url,
          filename: `image_${Date.now()}_${index}.${extension}`,
          conflictAction: "uniquify"
        });
      });
    }
  });
  