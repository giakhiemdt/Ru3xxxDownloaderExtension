console.log("Content script loaded.");


const container = document.querySelector("#post-list > div.content > div.image-list");
if (!container) {
  console.warn("Không tìm thấy image list.");
}

const spans = container.querySelectorAll("span");
const selectedImages = new Set();

// Tạo checkbox overlay
spans.forEach((span) => {
  const anchor = span.querySelector("a");
  const img = anchor.querySelector("img");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "image-checkbox";
  checkbox.style.position = "absolute";
  checkbox.style.top = "6px";
  checkbox.style.right = "6px";
  checkbox.style.zIndex = "999";
  checkbox.style.width = "20px";
  checkbox.style.height = "20px";

  const wrapper = document.createElement("div");
  wrapper.style.position = "relative";
  wrapper.style.display = "inline-block";
  wrapper.appendChild(img.cloneNode(true));
  wrapper.appendChild(checkbox);

  anchor.replaceWith(wrapper);

  wrapper.addEventListener("click", () => {
    checkbox.checked = !checkbox.checked;
    const imgUrl = img.src;
    if (checkbox.checked) {
      selectedImages.add(imgUrl);
    } else {
      selectedImages.delete(imgUrl);
    }
  });
});

// Nút download cố định
const button = document.createElement("button");
button.textContent = "Download";
button.style.position = "fixed";
button.style.bottom = "20px";
button.style.right = "20px";
button.style.padding = "10px 20px";
button.style.backgroundColor = "#007bff";
button.style.color = "#fff";
button.style.border = "none";
button.style.borderRadius = "5px";
button.style.zIndex = "10000";
button.style.cursor = "pointer";
document.body.appendChild(button);

const selectAllButton = document.createElement("button");
selectAllButton.textContent = "Select All";
selectAllButton.style.position = "fixed";
selectAllButton.style.bottom = "60px";  // trên nút Download
selectAllButton.style.right = "20px";
selectAllButton.style.padding = "10px 20px";
selectAllButton.style.backgroundColor = "#28a745";
selectAllButton.style.color = "#fff";
selectAllButton.style.border = "none";
selectAllButton.style.borderRadius = "5px";
selectAllButton.style.zIndex = "10000";
selectAllButton.style.cursor = "pointer";
document.body.appendChild(selectAllButton);

selectAllButton.addEventListener("click", () => {
  // Chọn hết checkbox
  document.querySelectorAll(".image-checkbox").forEach((checkbox) => {
    checkbox.checked = true;
    const imgUrl = checkbox.parentElement.querySelector("img").src;
    selectedImages.add(imgUrl);
  });
});

// Chuyển thumbnail → ảnh rõ
function convertThumbnailToImageUrl(thumbUrl, ext = "png") {
  try {
    const [baseUrl, query] = thumbUrl.split("?");
    const parts = baseUrl.split("/");
    const id = parts[parts.length - 2];
    const filename = parts[parts.length - 1];
    const hash = filename.replace("thumbnail_", "").replace(/\.\w+$/, "");
    const newUrl = `https://wimg.rule34.xxx/images/${id}/${hash}.${ext}`;
    return query ? `${newUrl}?${query}` : newUrl;
  } catch {
    return null;
  }
}

// Kiểm tra ảnh có tồn tại bằng Image()
function checkImageExistsViaImgTag(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(url);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

button.addEventListener("click", async () => {
  if (selectedImages.size === 0) {
    alert("Vui lòng chọn ít nhất một ảnh để tải xuống.");
    return;
  }

  const thumbnails = Array.from(selectedImages);
  const validUrls = [];

  button.disabled = true; // khóa nút khi đang tải
  let completed = 0;
  button.textContent = `Đang tải 0/${thumbnails.length}...`;

  for (const thumbUrl of thumbnails) {
    const extensions = ["png", "jpg", "jpeg", "webp"];
    let validUrl = null;

    for (const ext of extensions) {
      const url = convertThumbnailToImageUrl(thumbUrl, ext);
      const exists = await checkImageExistsViaImgTag(url);
      if (exists) {
        validUrl = url;
        break;
      }
    }

    if (validUrl) {
      validUrls.push(validUrl);
    } else {
      console.warn("Không tìm thấy ảnh ở định dạng nào:", thumbUrl);
    }

    completed++;
    button.textContent = `Đang tải ${completed}/${thumbnails.length}...`;
  }  

  if (validUrls.length > 0) {
    chrome.runtime.sendMessage({ type: "DOWNLOAD_IMAGES", images: validUrls });
  } else {
    alert("Không có ảnh hợp lệ để tải.");
  }

  button.textContent = "Download";
  button.disabled = false;
});
