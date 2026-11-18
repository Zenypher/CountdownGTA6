import { release } from "./config.mjs";
import { getRemaining } from "./countdown.mjs";
import { createFinaleScene, MUSIC_LEAD_MS } from "./finale.mjs";
import { createFinaleAudio } from "./finale-audio.mjs";

const timer = document.getElementById("timer");
const status = document.getElementById("countdown-status");
const headerHeadings = [...document.querySelectorAll("header h1")];
const countdownHeadings = headerHeadings.map((heading) => heading.textContent);
const completedHeadings = ["The wait is over", "Welcome to Vice City"];
const targetMs = Date.parse(release.target);
const updateFinale = createFinaleScene();
const finaleAudio = createFinaleAudio();
let interval;
let animationFrame = null;

const completionMessage = [
  "After 13 long years, the wait is finally over!",
  "To those who made it here, enjoy every moment.",
  "To those who couldn't, but dreamed of seeing this day, you are not forgotten.",
  "This moment is for all of us!",
].join("\n");

function animateFinale() {
  animationFrame = null;
  const distanceMs = targetMs - Date.now();
  const phase = updateFinale(distanceMs);
  if (phase === "zooming" || (phase === "masked" && distanceMs <= MUSIC_LEAD_MS)) {
    animationFrame = requestAnimationFrame(animateFinale);
  } else if (phase === "complete") {
    render(false);
  }
}

document.getElementById("footer-text").textContent = `© ${new Date().getFullYear()} Sebastian Iosif | Grand Theft Auto VI Countdown`;

document.getElementById("release-source").href = release.sourceUrl;

function formatUnit(value, unit) {
  return `${value}\u00a0${unit}${value === 1 ? "" : "s"}`;
}

function startCountdown() {
  finaleAudio.reset();
  clearInterval(interval);
  cancelAnimationFrame(animationFrame);
  animationFrame = null;
  status.textContent = "";
  timer.dataset.state = "counting";
  if (!Number.isFinite(targetMs)) {
    timer.textContent = "Release date unavailable.";
    return;
  }

  if (render()) {
    interval = setInterval(render, 1000);
  }
}

function render(updateScene = true) {
  const now = Date.now();
  const activeTarget = targetMs;
  const remaining = getRemaining(activeTarget, now);
  finaleAudio.update(activeTarget - now);
  timer.dataset.state = remaining.expired ? "complete" : "counting";
  const headings = remaining.expired ? completedHeadings : countdownHeadings;
  headerHeadings.forEach((heading, index) => {
    if (heading.textContent !== headings[index]) heading.textContent = headings[index];
  });
  if (updateScene && animationFrame === null) {
    updateFinale(activeTarget - now);
  }
  if (activeTarget - now <= MUSIC_LEAD_MS &&
      activeTarget > now && animationFrame === null) {
    animationFrame = requestAnimationFrame(animateFinale);
  }
  if (remaining.expired) {
    timer.textContent = completionMessage;
    clearInterval(interval);
    return false;
  }

  timer.textContent = [
    [remaining.days, "day"],
    [remaining.hours, "hour"],
    [remaining.minutes, "minute"],
    [remaining.seconds, "second"],
  ]
    .filter(([value]) => value > 0)
    .map(([value, unit]) => formatUnit(value, unit))
    .join(" ");

  return true;
}

startCountdown();
