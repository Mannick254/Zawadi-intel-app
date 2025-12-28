function startTime() {
  const today = new Date();
  let h = today.getHours();
  let m = today.getMinutes();
  let s = today.getSeconds();
  m = checkTime(m);
  s = checkTime(s);
  document.getElementById('clock').innerHTML =  h + ":" + m + ":" + s;
  setTimeout(startTime, 1000);
}

function checkTime(i) {
  if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
  return i;
}

function renderCalendarWidget() {
  const calendarEl = document.getElementById('calendar-widget');
  if (!calendarEl) return;
  const today = new Date();
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const day = today.getDate();
  const month = monthNames[today.getMonth()];
  const year = today.getFullYear();

  calendarEl.innerHTML = `<div class="date-display">${day} ${month}, ${year}</div>`;
}

document.addEventListener('DOMContentLoaded', () => {
    startTime();
    renderCalendarWidget();
});
