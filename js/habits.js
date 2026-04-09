const STORAGE_KEY = 'streak_habits';

const PRESETS = [
  '💧 Drink Water',
  '🏃 Exercise',
  '📖 Read',
  '🧘 Meditate',
  '😴 Sleep by 11PM',
  '📵 No Social Media',
  '✍️ Journal',
  '🥗 Eat Healthy',
];

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function loadHabits() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveHabits(habits) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function toDateString(date) {
  return date.toISOString().split('T')[0];
}

function getToday() {
  return toDateString(new Date());
}

function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(toDateString(d));
  }
  return days;
}

function hasCheckedInToday(habit) {
  return habit.checkedDates.includes(getToday());
}

function calculateStreak(habit) {
  if (habit.checkedDates.length === 0) return 0;

  const sorted = [...habit.checkedDates].sort().reverse();
  const today = getToday();
  const yesterday = toDateString(new Date(Date.now() - 86400000));

  if (sorted[0] !== today && sorted[0] !== yesterday) return 0;

  let streak = 0;
  let current = new Date();

  if (sorted[0] === yesterday) {
    current.setDate(current.getDate() - 1);
  }

  while (true) {
    const dateStr = toDateString(current);
    if (habit.checkedDates.includes(dateStr)) {
      streak++;
      current.setDate(current.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export {
  PRESETS,
  DAY_LABELS,
  loadHabits,
  saveHabits,
  generateId,
  getToday,
  getLast7Days,
  hasCheckedInToday,
  calculateStreak,
};