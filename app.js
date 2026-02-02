const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

function loadStreak() {
  return JSON.parse(localStorage.getItem('streak')) || {
    currentStreak: 0,
    lastUpdated: null,
    completedDays: Array(7).fill(false),
  };
}

function saveStreak(streak) {
  localStorage.setItem('streak', JSON.stringify(streak));
}

function resetStreak(streak) {
  streak.currentStreak = 0;
  streak.completedDays = Array(7).fill(false);
  saveStreak(streak);
}

function updateUI(streak) {
  document.querySelector('.streak-count').textContent = `${streak.currentStreak} days`;

  document.querySelectorAll('.day').forEach((dayEl, i) => {
    if (streak.completedDays[i]) {
      dayEl.classList.add('checked');
    } else {
      dayEl.classList.remove('checked');
    }
  });
}

function checkStreakCondition(streak) {
  if (!streak.lastUpdated) return;

  const lastDate = new Date(streak.lastUpdated);
  const today = new Date();
  const diffTime = today - lastDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays > 1) {
    resetStreak(streak);
  }
}

const checkinBtn = document.querySelector('.checkin-btn');
checkinBtn.addEventListener('click', () => {
  const streak = loadStreak();

  if (streak.completedDays[todayIndex]) {
    alert('You have already checked in today!');
    return;
  }

  streak.completedDays[todayIndex] = true;
  streak.currentStreak += 1;
  streak.lastUpdated = new Date().toISOString();

  saveStreak(streak);
  updateUI(streak);
  const rect = checkinBtn.getBoundingClientRect();
  confetti({
    particleCount: 200,
    spread: 100,
    origin: {
      x: (rect.left + rect.right) / (2 * window.innerWidth),
      y: (rect.top + rect.bottom) / (2 * window.innerHeight)
    }
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const streak = loadStreak();
  checkStreakCondition(streak);
  updateUI(streak);
});