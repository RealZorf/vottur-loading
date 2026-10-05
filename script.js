var backgrounds = [
	"backgrounds/background01.png",
	"backgrounds/background02.png",
	"backgrounds/background03.png",
	"backgrounds/background04.png",
	"backgrounds/background05.png",
	"backgrounds/background06.png",
	"backgrounds/background07.png",
	"backgrounds/background08.png",
	"backgrounds/background09.png",
	"backgrounds/background10.png",
	"backgrounds/background11.png",
];

var models = [
	"models/model01.png",
	"models/model02.png",
	"models/model03.png",
	"models/model04.png",
	"models/model05.png",
	/*"models/model06.png",
	"models/model07.png",
	"models/model08.png",
	"models/model09.png",
	"models/model10.png",*/
];

var scene = document.getElementById("scene");
var layers = [
	document.getElementById("layer-a"),
	document.getElementById("layer-b"),
];
var active = 0;
var lastBg = "";
var lastModel = "";
var lastSide = "";
var sides = ["left", "center", "right"];
var hideWait = null;
var nextReady = null;

function pick(list, last) {
	var item;
	do {
		item = list[Math.floor(Math.random() * list.length)];
	} while (item === last && list.length > 1);
	return item;
}

function panTime() {
	return 10000 + Math.floor(Math.random() * 3000);
}

function layerParts(layer) {
	return {
		bg: layer.querySelector(".bg"),
		wrap: layer.querySelector(".model-wrap"),
		model: layer.querySelector(".model"),
	};
}

function loadImg(img, src) {
	return new Promise(function (resolve) {
		function done() {
			if (img.decode) {
				img.decode().then(resolve, resolve);
			} else {
				resolve();
			}
		}

		if (img.getAttribute("src") === src && img.complete && img.naturalWidth) {
			done();
			return;
		}

		img.onload = done;
		img.onerror = resolve;
		img.src = src;
	});
}

function loadPair(layer) {
	lastBg = pick(backgrounds, lastBg);
	lastModel = pick(models, lastModel);

	var parts = layerParts(layer);
	return Promise.all([
		loadImg(parts.bg, lastBg),
		loadImg(parts.model, lastModel),
	]);
}

function startPan(layer, ms) {
	var parts = layerParts(layer);
	var bgZoomIn = Math.random() < 0.5;
	var slide = Math.random() < 0.5 ? "slide-left" : "slide-right";
	lastSide = pick(sides, lastSide);

	parts.wrap.className = "model-wrap " + lastSide;
	parts.bg.className = "bg";
	parts.model.className = "model";
	parts.bg.offsetWidth;
	parts.model.offsetWidth;

	parts.bg.style.animationDuration = ms + "ms";
	parts.model.style.animationDuration = ms + "ms";

	if (bgZoomIn) {
		parts.bg.classList.add("zoom-in");
		parts.model.classList.add("zoom-out");
	} else {
		parts.bg.classList.add("zoom-out");
		parts.model.classList.add("zoom-in");
	}

	parts.model.classList.add(slide);
}

function afterPaint(fn) {
	requestAnimationFrame(function () {
		requestAnimationFrame(fn);
	});
}

function whenHidden(fn) {
	var finished = false;

	function run() {
		if (finished) {
			return;
		}
		finished = true;
		if (hideWait) {
			scene.removeEventListener("transitionend", hideWait);
			hideWait = null;
		}
		fn();
	}

	if (scene.classList.contains("hide") && parseFloat(getComputedStyle(scene).opacity) === 0) {
		run();
		return;
	}

	hideWait = function (e) {
		if (e.target !== scene || e.propertyName !== "opacity") {
			return;
		}
		run();
	};

	scene.addEventListener("transitionend", hideWait);
	setTimeout(run, 1000);
}

function showLayer(index) {
	layers[0].classList.toggle("active", index === 0);
	layers[1].classList.toggle("active", index === 1);
	active = index;
}

function prepareNext() {
	var next = 1 - active;
	nextReady = loadPair(layers[next]);
}

function reveal(ms) {
	afterPaint(function () {
		scene.classList.remove("hide");
		prepareNext();
		setTimeout(swap, ms);
	});
}

function swap() {
	var next = 1 - active;

	scene.classList.add("hide");

	whenHidden(function () {
		(nextReady || loadPair(layers[next])).then(function () {
			nextReady = null;
			var ms = panTime();
			showLayer(next);
			startPan(layers[next], ms);
			reveal(ms);
		});
	});
}

var intro = document.getElementById("intro");
var logo = intro ? intro.querySelector("img") : null;

loadPair(layers[0]).then(function () {
	showLayer(0);
});

setTimeout(function () {
	if (logo) {
		logo.classList.add("pop");
	}
}, 3500);

setTimeout(function () {
	if (logo) {
		logo.classList.add("fade");
	}
}, 10500);

setTimeout(function () {
	var ms = panTime();
	startPan(layers[active], ms);
	reveal(ms);
	if (intro) {
		intro.classList.add("gone");
		setTimeout(function () {
			intro.style.display = "none";
		}, 900);
	}
}, 12500);

var music = document.getElementById("music");
music.volume = 0.35;
music.play().catch(function () {});
