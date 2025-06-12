function getTodayDateStr() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

function getYesterdayDateStr() {
  const yesterday = new Date(Date.now() - 86400000);
  return yesterday.toISOString().split('T')[0];
}

function submitCode() {
  const code = document.getElementById('code-input').value.trim();
  const message = document.getElementById('message');
  const today = getTodayDateStr();

  if (!code) {
    message.textContent = "Please paste your code before submitting.";
    return;
  }

  const lastDate = localStorage.getItem('lastDate');
  let streak = parseInt(localStorage.getItem('streak') || "0");

  if (lastDate === today) {
    message.textContent = "You've already submitted code today!";
    return;
  }

  if (lastDate === getYesterdayDateStr()) {
    streak += 1;
  } else {
    streak = 1;
  }

  localStorage.setItem('lastDate', today);
  localStorage.setItem('streak', streak);
  localStorage.setItem(`code_${today}`, code);

  document.getElementById('streak-count').textContent = streak;
  message.textContent = "Code submitted successfully! 🔥";
  document.getElementById('code-input').value = "";

  loadHistory();
  loadCalendar();
}

function loadStreak() {
  const streak = localStorage.getItem('streak') || 0;
  document.getElementById('streak-count').textContent = streak;
}

function loadHistory() {
  const historyList = document.getElementById('history-list');
  historyList.innerHTML = "";

  for (let key in localStorage) {
    if (key.startsWith("code_")) {
      const date = key.split("_")[1];
      const item = document.createElement("div");
      item.className = "history-item";
      item.innerHTML = `
        <span>${date}</span>
        <button onclick="showCode('${date}')">View Code</button>
      `;
      historyList.appendChild(item);
    }
  }
}

function loadCalendar() {
  const calendar = document.getElementById("calendar");
  calendar.innerHTML = "";

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0 = Jan
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const box = document.createElement("div");
    box.className = "day-box";

    if (localStorage.getItem(`code_${dateStr}`)) {
      box.classList.add("green");
    } else {
      box.classList.add("gray");
    }

    box.title = dateStr;
    box.textContent = day;
    box.onclick = () => showCode(dateStr);
    calendar.appendChild(box);
  }
}

function showCode(date) {
  const code = localStorage.getItem(`code_${date}`) || "No code found.";
  document.getElementById("popup-code").textContent = code;
  document.getElementById("popup-date").textContent = `Code from ${date}`;
  document.getElementById("popup").classList.remove("hidden");
}

function closePopup() {
  document.getElementById("popup").classList.add("hidden");
}

window.onload = function () {
  loadStreak();
  loadHistory();
  loadCalendar();
};
