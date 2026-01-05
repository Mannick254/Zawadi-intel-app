function padZero(num) {
  return num < 10 ? "0" + num : num;
}

function updateClock() {
  const now = new Date();
  let hours = now.getHours();
  const minutes = padZero(now.getMinutes());
  const seconds = padZero(now.getSeconds());

  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  const clockEl = document.getElementById("clock");
  if (clockEl) {
    clockEl.textContent = `${hours}:${minutes}:${seconds} ${ampm}`;
  }
}

function updateCalendar() {
  const calendarEl = document.getElementById("calendar-widget");
  if (!calendarEl) return;

  const now = new Date();
  const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const monthNames = ["January","February","March","April","May","June",
    "July","August","September","October","November","December"];

  const weekday = dayNames[now.getDay()];
  const day = now.getDate();
  const month = monthNames[now.getMonth()];
  const year = now.getFullYear();

  calendarEl.textContent = `${weekday}, ${day} ${month} ${year}`;
}

document.addEventListener("DOMContentLoaded", () => {
  updateClock();
  updateCalendar();
  setInterval(updateClock, 1000); // refresh clock every second
});
