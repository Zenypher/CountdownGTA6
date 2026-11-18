export const FINAL_HOUR_MS = 60 * 60 * 1000;
export const MUSIC_LEAD_MS = 12 * 1000;
export const TRANSITION_DELAY_MS = 4 * 1000;
export const TRANSITION_MS = MUSIC_LEAD_MS - TRANSITION_DELAY_MS;

export function getZoomScale(progress, finalScale = 300) {
  const t = Math.max(0, Math.min(1, progress));
  const eased = t * t * t * (t * (t * 6 - 15) + 10);
  return Math.exp(Math.log(finalScale) * eased);
}

export function getFinaleState(distanceMs) {
  if (distanceMs <= 0) return { phase: "complete", progress: 1 };
  if (distanceMs > FINAL_HOUR_MS) return { phase: "normal", progress: 0 };
  if (distanceMs > TRANSITION_MS) return { phase: "masked", progress: 0 };
  return { phase: "zooming", progress: 1 - distanceMs / TRANSITION_MS };
}

export function getPortalLayout(viewportWidth, viewportHeight) {
  const width = Math.min(viewportWidth * 0.56, viewportHeight * 0.42 * 980 / 743.98, 520);
  const height = width * 743.98 / 980;
  const x = (viewportWidth - width) / 2;
  const y = (viewportHeight - height) / 2;
  return {
    width, height, x, y, viewportWidth, viewportHeight,
    focusX: x + width * (643.64682 - 10) / 980,
    focusY: y + height * (357.82529 - 28.01) / 743.98,
  };
}

export function getPortalMatrix(layout, progress) {
  const baseScale = layout.width / 980;
  const finalScale = 1.05 * Math.max(
    layout.viewportWidth / (10.2829 * baseScale),
    layout.viewportHeight / (16.31195 * baseScale),
  );
  const zoom = getZoomScale(progress, finalScale);
  const scale = layout.width / 980 * zoom;
  const panX = (layout.viewportWidth / 2 - layout.focusX) * (1 - 1 / zoom);
  const panY = (layout.viewportHeight / 2 - layout.focusY) * (1 - 1 / zoom);
  return [
    scale, 0, 0, scale,
    zoom * layout.x + (1 - zoom) * layout.focusX + panX - 10 * scale,
    zoom * layout.y + (1 - zoom) * layout.focusY + panY - 28.01 * scale,
  ];
}

export function createFinaleScene() {
  const overlay = document.getElementById("finale-overlay");
  const geometry = document.getElementById("finale-logo-mask");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const header = document.querySelector("header");
  const footer = document.querySelector("footer");
  let previousPhase;
  let layout;
  let currentProgress = 0;
  let drawnProgress;
  const styleValues = new Map();

  function setStyle(name, value) {
    if (styleValues.get(name) === value) return;
    styleValues.set(name, value);
    overlay.style.setProperty(name, value);
  }

  function draw() {
    const progress = reducedMotion.matches ? 0 : currentProgress;
    if (progress === drawnProgress) return;
    drawnProgress = progress;
    const matrix = getPortalMatrix(layout, progress);
    geometry.setAttribute("transform", `matrix(${matrix.join(" ")})`);
  }

  function resize() {
    layout = getPortalLayout(innerWidth, innerHeight);
    drawnProgress = undefined;
    const { y, height } = layout;
    setStyle("--logo-top", `${y}px`);
    setStyle("--logo-bottom", `${y + height}px`);
    if (!overlay.hidden) draw();
  }

  addEventListener("resize", resize);
  reducedMotion.addEventListener("change", () => {
    drawnProgress = undefined;
    if (!overlay.hidden) draw();
  });
  resize();

  return function update(distanceMs) {
    const { phase, progress } = getFinaleState(distanceMs);
    const active = phase === "masked" || phase === "zooming";
    if (phase !== previousPhase) {
      document.body.dataset.finale = phase;
      overlay.hidden = !active;
      header.inert = active;
      footer.inert = active;
    }
    currentProgress = progress;
    if (active) draw();
    const fadeDurationMs = 3000;
    const fade = Math.max(0, Math.min(1, (fadeDurationMs - distanceMs) / fadeDurationMs));
    setStyle("--gradient-opacity", 1 - fade * fade * (3 - 2 * fade));
    setStyle("--portal-opacity", reducedMotion.matches
      ? 1 - fade * fade * (3 - 2 * fade) : 1);
    const wasCovered = previousPhase === "masked" || previousPhase === "zooming";

    if (wasCovered && !active) {
      replayPageEntrance(reducedMotion);
    }

    previousPhase = phase;
    return phase;
  };
}

function replayPageEntrance(reducedMotion) {
  if (reducedMotion.matches) return;

  const elements = [
    ...document.querySelectorAll(
      "header h1, #logo, #timer, #countdown-status, footer"
    ),
  ];

  const previousAnimations = elements.map((element) => element.style.animation);

  elements.forEach((element) => {
    element.style.animation = "none";
  });

  void document.body.offsetWidth;

  elements.forEach((element, index) => {
    element.style.animation = previousAnimations[index];
  });
}
