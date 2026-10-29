import { release } from "./config.mjs";
import { getRemaining } from "./countdown.mjs";

const timer = document.getElementById("timer");
const status = document.getElementById("countdown-status");
const releaseNote = document.getElementById("release-note");
const targetMs = Date.parse(release.target);

document.getElementById("footer-text").textContent = `© ${new Date().getFullYear()} Sebastian Iosif | Grand Theft Auto VI Countdown`;

document.getElementById("release-source").href = release.sourceUrl;

function formatUnit(value, unit) {
  return `${value} ${unit}${value === 1 ? "" : "s"}`;
}

function startCountdown() {
  if(!Number.isFinite(targetMs)) {
    timer.textContent = "Release date unavailable.";
    return;
  }

  const dateLabel = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(targetMs);

  let interval;

  function render() {
    const remaining = getRemaining(targetMs, Date.now());

    if(remaining.expired) {
      timer.textContent = "Target date reached";
      status.textContent = "Check official updates for availability";
      clearInterval(interval);
      return false;
    }

    timer.textContent = [
      formatUnit(remaining.days, "day"),
      formatUnit(remaining.hours, "hour"),
      formatUnit(remaining.minutes, "minute"),
      formatUnit(remaining.seconds, "second"),
    ].join(" ");

    return true;
  }

  if (render()) {
    interval = setInterval(render, 1000);
  }
}

startCountdown();