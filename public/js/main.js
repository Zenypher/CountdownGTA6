const pageLogo = document.getElementById("logo");
const leftTitle = document.querySelector(".title-1");
const rightTitle = document.querySelector(".title-2");

function startCountdown(targetDateString) {
  const timerElement = document.getElementById("timer");
  const targetDate = new Date(targetDateString).getTime();

  const interval = setInterval(() => {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance < 0) {
      clearInterval(interval);
      timerElement.textContent = "Countdown finished";
      return;
    }

    const months = Math.floor(distance / (1000 * 60 * 60 * 24 * 30));
    const days = Math.floor(
      (distance % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24)
    );
    const hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    timerElement.innerHTML = `${
      months > 1 ? months + " months" : months + " month"
    } ${days > 1 ? days + " days" : days + " day"} ${
      hours > 1 ? hours + " hours" : hours + " hour"
    } ${minutes > 1 ? minutes + " minutes " : minutes + " minute"} ${
      seconds > 1 ? seconds + " seconds" : seconds + " second"
    }`;
  }, 1000);
}

addEventListener("DOMContentLoaded", () => {
  startCountdown("2026-05-26");
  pageLogo.classList.add("animate");
  leftTitle.classList.add("animate");
  rightTitle.classList.add("animate");
});
