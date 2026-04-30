import {
  PRESETS,
  DAY_LABELS,
  loadHabits,
  saveHabits,
  generateId,
  getToday,
  getLast7Days,
  hasCheckedInToday,
  calculateStreak,
} from './habits.js';

let selectedPreset = null;
let pendingDeleteId = null;

function renderHabits() {
  const habits = loadHabits();
  const list = document.getElementById('habitList');
  const emptyState = document.getElementById('emptyState');

  list.querySelectorAll('.habit-card').forEach(el => el.remove());

  if (habits.length === 0) {
    emptyState.style.display = 'flex';
    return;
  }

  emptyState.style.display = 'none';

  habits.forEach(habit => {
    const card = buildCard(habit);
    list.appendChild(card);
  });
}

function buildCard(habit) {
  const streak = calculateStreak(habit);
  const checkedToday = hasCheckedInToday(habit);
  const last7 = getLast7Days();
  const today = getToday();

  const card = document.createElement('div');
  card.className = 'habit-card';
  card.dataset.id = habit.id;

  const daysHTML = last7.map(dateStr => {
    const isToday = dateStr === today;
    const isFilled = habit.checkedDates.includes(dateStr);
    const d = new Date(`${dateStr}T00:00:00`);
    const label = DAY_LABELS[d.getDay()];

    return `
      <div class="day-item">
        <div class="day-dot ${isFilled ? 'filled' : ''} ${isToday ? 'today' : ''}"></div>
        <span class="day-label ${isToday ? 'today' : ''}">${label}</span>
      </div>
    `;
  }).join('');

  card.innerHTML = `
    <div class="card-top">
      <div>
        <div class="habit-name">${habit.name}</div>
        <div class="habit-streak">
          <span class="streak-number">${streak}</span>
          <span class="streak-label">${streak === 1 ? 'day' : 'days'}</span>
        </div>
      </div>
      <button class="delete-habit-btn" data-id="${habit.id}" aria-label="Delete habit">✕</button>
    </div>
    <div class="days-row">${daysHTML}</div>
    <button class="checkin-btn" data-id="${habit.id}" ${checkedToday ? 'disabled' : ''}>
      ${checkedToday ? '✓ Checked In' : 'Check In'}
    </button>
  `;

  card.querySelector('.checkin-btn').addEventListener('click', (e) => {
    handleCheckIn(habit.id, e.currentTarget);
  });

  card.querySelector('.delete-habit-btn').addEventListener('click', () => {
    openDeleteModal(habit.id);
  });

  return card;
}

function handleCheckIn(habitId, btn) {
  const habits = loadHabits();
  const habit = habits.find(h => h.id === habitId);
  if (!habit || hasCheckedInToday(habit)) return;

  habit.checkedDates.push(getToday());
  saveHabits(habits);
  renderHabits();

  confetti({
    particleCount: 120,
    spread: 80,
    colors: ['#ff9f1c', '#ffcc02', '#ff6b6b', '#34c759'],
  });
}

function openAddModal() {
  selectedPreset = null;
  document.getElementById('habitInput').value = '';
  document.getElementById('reminderTime').value = '';
  document.querySelectorAll('.preset-chip').forEach(c => c.classList.remove('selected'));
  document.getElementById('modalOverlay').classList.add('active');
  setTimeout(() => document.getElementById('habitInput').focus(), 300);
}

function closeAddModal() {
  document.getElementById('modalOverlay').classList.remove('active');
}

async function handleAddHabit() {
  const input = document.getElementById('habitInput').value.trim();
  const name = input || selectedPreset;

  if (!name) {
    document.getElementById('habitInput').focus();
    return;
  }

  const reminderTime = document.getElementById('reminderTime').value || null;

  // Request notification permission if a reminder was set
  if (reminderTime && 'Notification' in window) {
    await Notification.requestPermission();
  }

  const habits = loadHabits();
  habits.push({
    id: generateId(),
    name,
    checkedDates: [],
    reminderTime,
  });

  saveHabits(habits);
  closeAddModal();
  renderHabits();
}

function openDeleteModal(habitId) {
  pendingDeleteId = habitId;
  document.getElementById('deleteOverlay').classList.add('active');
}

function closeDeleteModal() {
  pendingDeleteId = null;
  document.getElementById('deleteOverlay').classList.remove('active');
}

function confirmDelete() {
  if (!pendingDeleteId) return;
  const habits = loadHabits().filter(h => h.id !== pendingDeleteId);
  saveHabits(habits);
  closeDeleteModal();
  renderHabits();
}

function renderPresets() {
  const grid = document.getElementById('presetsGrid');
  PRESETS.forEach(preset => {
    const chip = document.createElement('button');
    chip.className = 'preset-chip';
    chip.textContent = preset;
    chip.addEventListener('click', () => {
      selectedPreset = preset;
      document.getElementById('habitInput').value = '';
      document.querySelectorAll('.preset-chip').forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
    });
    grid.appendChild(chip);
  });
}

function addEventListeners() {
  document.getElementById('addHabitBtn').addEventListener('click', openAddModal);
  document.getElementById('emptyAddBtn').addEventListener('click', openAddModal);
  document.getElementById('closeModal').addEventListener('click', closeAddModal);
  document.getElementById('confirmBtn').addEventListener('click', handleAddHabit);
  document.getElementById('cancelDelete').addEventListener('click', closeDeleteModal);
  document.getElementById('confirmDelete').addEventListener('click', confirmDelete);

  document.getElementById('modalOverlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeAddModal();
  });

  document.getElementById('deleteOverlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeDeleteModal();
  });

  document.getElementById('habitInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleAddHabit();
  });
}

async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('./serviceWorker.js');
      console.log('Service Worker registered.');
    } catch (error) {
      console.warn('Service Worker registration failed:', error);
    }
  }
}

function checkReminders() {
  if (Notification.permission !== 'granted') return;

  const habits = loadHabits();
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const today = getToday();

  habits.forEach(habit => {
    if (!habit.reminderTime) return;
    if (hasCheckedInToday(habit)) return;

    // Fire if current time is at or past the reminder time
    if (currentTime >= habit.reminderTime) {
      // Only fire once per day, track last notified date
      const notifiedKey = `streak-notified-${habit.id}`;
      const lastNotified = localStorage.getItem(notifiedKey);
      if (lastNotified === today) return;

      navigator.serviceWorker.ready.then(sw => {
        sw.showNotification('Streak', {
          body: `Don't break your streak. Check in for "${habit.name}" 🔥`,
          icon: './assets/favicons/android-chrome-192x192.png',
          badge: './assets/favicons/android-chrome-192x192.png',
          tag: habit.id,
        });
      });

      localStorage.setItem(notifiedKey, today);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderPresets();
  renderHabits();
  addEventListeners();
  registerServiceWorker();
  checkReminders();
  
  setInterval(checkReminders, 60 * 1000);
});
