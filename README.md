# Streak

A simple, elegant habit-tracking Progressive Web App (PWA) that helps you build and maintain daily streaks. Track your habits with a clean interface, visual progress indicators, and automatic dark mode support.

## Live Preview

[Preview Streak](https://paulspective.github.io/streak/)

## Features

- **Habit Tracking**: Add custom habits or choose from preset options
- **Streak Calculation**: Automatically calculates current streaks based on check-ins
- **Visual Progress**: 7-day calendar view showing recent activity
- **Dark Mode**: Automatically follows your system's color scheme preference
- **Offline Support**: Works without an internet connection using service workers
- **Installable App**: Can be installed on mobile and desktop like a native app
- **Local Storage**: Data persists locally in your browser
- **Confetti Celebrations**: Fun animations when checking in

## Tech Stack

- **HTML5**: Semantic markup and structure
- **CSS3**: Custom properties, animations, and responsive design
- **JavaScript (ES6+)**: Modular code with ES modules
- **Service Workers**: Enable offline functionality and caching
- **Web App Manifest**: Provides installable app experience
- **Canvas Confetti**: For celebration effects

## Getting Started

### Prerequisites

- A modern web browser with service worker support (Chrome, Edge, Safari, Firefox)
- A local server for best results, since ES modules and service workers require a secure context

### Run Locally

1. Open the project in your code editor
2. Start a local server from the project root  
   - Recommended: VS Code Live Server
3. Open `index.html` in the browser

## Usage

1. **Add a Habit**: Click the "+" button to create a new habit
2. **Choose Preset**: Select from common habits or enter a custom name
3. **Check In**: Click "Check In" each day to maintain your streak
4. **View Progress**: See your current streak and recent 7-day activity
5. **Delete Habits**: Use the "✕" button to remove habits (streak will be lost)

## Project Structure

```
streak/
├── assets/
├── ├──favicons/
│   └── fonts/
├── js/
│   ├── app.js
│   └── habits.js
├── index.html
├── LICENSE
├── README.md
├── manifest.json
├── serviceWorker.js
└── style.css
```

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is open source and available under the [MIT License](LICENSE).</content>