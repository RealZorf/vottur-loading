const fade = 1500;
const bg = document.getElementById("bg");
const slides = [];

for (let n = 1; n <= 11; n++) {
  const img = new Image();
  img.src = "backgrounds/" + n + ".jpg";
  img.alt = "";
  bg.appendChild(img);
  slides.push(img);
}

let current = Math.floor(Math.random() * slides.length);
let z = 1;
slides[current].style.zIndex = z;
slides[current].style.opacity = "1";

if (slides.length > 1) {
  setInterval(function () {
    const prev = slides[current];
    current = (current + 1) % slides.length;
    const next = slides[current];

    next.style.transition = "none";
    next.style.opacity = "0";
    next.style.zIndex = ++z;
    void next.offsetWidth;
    next.style.transition = "opacity " + fade + "ms ease";
    next.style.opacity = "1";

    setTimeout(function () {
      prev.style.transition = "none";
      prev.style.opacity = "0";
    }, fade);
  }, 10000);
}

const track = document.getElementById("track");
const fill = document.getElementById("fill");
const statusEl = document.getElementById("status");
let filesTotal = 0;
let filesNeeded = 0;
let gotNeeded = false;
let filesSeen = 0;

function paint() {
  let pct = -1;

  if (filesTotal > 0 && (gotNeeded || filesSeen > 0)) {
    const fromCount = gotNeeded ? Math.max(0, filesTotal - filesNeeded) : 0;
    pct = (Math.max(fromCount, Math.min(filesSeen, filesTotal)) / filesTotal) * 100;
  }

  if (pct <= 0) {
    fill.style.width = "";
    fill.style.transform = "";
    track.classList.add("indeterminate");
    return;
  }

  track.classList.remove("indeterminate");
  fill.style.transform = "none";
  fill.style.width = Math.min(100, pct) + "%";
}

window.GameDetails = function (servername, serverurl, mapname) {
  document.getElementById("server").textContent = servername;
  document.getElementById("map").textContent = mapname;
};

window.SetStatusChanged = function (status) {
  statusEl.textContent = status;
};

window.SetFilesTotal = function (total) {
  filesTotal = total;
  paint();
};

window.SetFilesNeeded = function (needed) {
  filesNeeded = needed;
  gotNeeded = true;
  paint();
};

window.DownloadingFile = function (fileName) {
  filesSeen++;
  statusEl.textContent = fileName;
  paint();
};
