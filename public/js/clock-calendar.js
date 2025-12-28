function startTime() {
  const today = new Date();
  let h = today.getHours();
  let m = today.getMinutes();
  let s = today.getSeconds();
  m = checkTime(m);
  s = checkTime(s);
  const clockEl = document.getElementById('clock');
  if (clockEl) {
    clockEl.innerHTML =  h + ":" + m + ":" + s;
  }
  setTimeout(startTime, 1000);
}

function checkTime(i) {
  if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
  return i;
}

function renderCalendar() {
  const calendarEl = document.getElementById('calendar');
  if (!calendarEl) {
    return;
  }
  const today = new Date();
  const month = today.getMonth();
  const year = today.getFullYear();
  const day = today.getDate();

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  let calendarHTML = `
    <div class="month">
      <ul>
        <li>${monthNames[month]}<br><span style="font-size:18px">${year}</span></li>
      </ul>
    </div>
    <ul class="weekdays">
      <li>Mo</li>
      <li>Tu</li>
      <li>We</li>
      <li>Th</li>
      <li>Fr</li>
      <li>Sa</li>
      <li>Su</li>
    </ul>
    <ul class="days">
  `;

  const firstDay = new Date(year, month, 1).getDay();
  // Adjust to make Monday the first day of the week
  const correctedFirstDay = (firstDay === 0) ? 6 : firstDay -1;


  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < correctedFirstDay; i++) {
    calendarHTML += `<li></li>`;
  }

  for (let i = 1; i <= daysInMonth; i++) {
    if (i === day) {
      calendarHTML += `<li><span class="active">${i}</span></li>`;
    } else {
      calendarHTML += `<li>${i}</li>`;
    }
  }

  calendarHTML += '</ul>';
  calendarEl.innerHTML = calendarHTML;
}

document.addEventListener('DOMContentLoaded', () => {
  startTime();
  renderCalendar();
});
