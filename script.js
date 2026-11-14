
const canvas = document.getElementById("cardCanvas");
const ctx = canvas.getContext("2d");

const nameInput = document.getElementById("nameInput");
const photoInput = document.getElementById("photoInput");
const zoom = document.getElementById("zoom");
const nameSize = document.getElementById("nameSize");
const downloadBtn = document.getElementById("downloadBtn");

const template = new Image();
template.src = "template.jpg";

let photo = null;
let photoScale = 1;
let photoX = 1148;
let photoY = 1255;
let nameX = 1160;
let nameY = 1550;
let dragging = null;
let start = null;

const photoBox = {
  x: 924,
  y: 1026,
  w: 448,
  h: 460
};

function draw() {
  if (!template.complete || !template.naturalWidth) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(template, 0, 0, 1568, 1656);

  // ছবি বসানো
  if (photo) {
    const base = Math.max(
      photoBox.w / photo.width,
      photoBox.h / photo.height
    );

    const w = photo.width * base * photoScale;
    const h = photo.height * base * photoScale;

    ctx.save();
    ctx.beginPath();
    ctx.rect(
      photoBox.x,
      photoBox.y,
      photoBox.w,
      photoBox.h
    );
    ctx.clip();

    ctx.drawImage(
      photo,
      photoX - w / 2,
      photoY - h / 2,
      w,
      h
    );

    ctx.restore();
  }

  // নাম বসানো
  const name = nameInput.value.trim();

  if (name) {
    ctx.save();

    ctx.fillStyle = "#80520a";
    ctx.beginPath();
    ctx.roundRect(835, 1512, 660, 68, 12);
    ctx.fill();

    let size = Number(nameSize.value);
    ctx.font = `bold ${size}px sans-serif`;

    while (ctx.measureText(name).width > 620 && size > 14) {
      size--;
      ctx.font = `bold ${size}px sans-serif`;
    }

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffffff";

    ctx.fillText(name, nameX, nameY, 620);

    ctx.restore();
  }
}

// টেমপ্লেট লোড
template.onload = draw;

// নাম পরিবর্তন
nameInput.addEventListener("input", draw);

// ছবি আপলোড
photoInput.addEventListener("change", function(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function(event) {
    photo = new Image();

    photo.onload = function() {
      photoX = photoBox.x + photoBox.w / 2;
      photoY = photoBox.y + photoBox.h / 2;
      photoScale = 1;
      zoom.value = 100;
      draw();
    };

    photo.src = event.target.result;
  };

  reader.readAsDataURL(file);
});

// ছবির আকার পরিবর্তন
zoom.addEventListener("input", function() {
  photoScale = Number(zoom.value) / 100;
  draw();
});

// নামের আকার পরিবর্তন
nameSize.addEventListener("input", draw);

// ছবি ও নাম টেনে সরানো
function getPoint(e) {
  const rect = canvas.getBoundingClientRect();

  return {
    x: (e.clientX - rect.left) * canvas.width / rect.width,
    y: (e.clientY - rect.top) * canvas.height / rect.height
  };
}

canvas.addEventListener("pointerdown", function(e) {
  const p = getPoint(e);

  if (
    p.y > 1490 && p.y < 1600 &&
    nameInput.value.trim()
  ) {
    dragging = "name";
    start = { x: p.x, y: p.y, bx: nameX, by: nameY };
  } else if (
    photo &&
    p.x > photoBox.x - 30 &&
    p.x < photoBox.x + photoBox.w + 30 &&
    p.y > photoBox.y - 30 &&
    p.y < photoBox.y + photoBox.h + 30
  ) {
    dragging = "photo";
    start = { x: p.x, y: p.y, bx: photoX, by: photoY };
  }

  if (dragging) canvas.setPointerCapture(e.pointerId);
});

canvas.addEventListener("pointermove", function(e) {
  if (!dragging || !start) return;

  const p = getPoint(e);
  const dx = p.x - start.x;
  const dy = p.y - start.y;

  if (dragging === "photo") {
    photoX = start.bx + dx;
    photoY = start.by + dy;
  } else {
    nameX = start.bx + dx;
    nameY = start.by + dy;
  }

  draw();
});

canvas.addEventListener("pointerup", function() {
  dragging = null;
  start = null;
});

canvas.addEventListener("pointercancel", function() {
  dragging = null;
  start = null;
});

// PNG ডাউনলোড
downloadBtn.addEventListener("click", function() {
  if (!photo) {
    alert("প্রথমে নিজের ছবি আপলোড করুন!");
    return;
  }

  draw();

  canvas.toBlob(function(blob) {
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "My-Photo-Card.png";
    link.click();

    URL.revokeObjectURL(url);
  }, "image/png");
});
