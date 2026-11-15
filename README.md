# 🧠 FlashMind

**A modern, open-source spaced-repetition web app combining the power and flexibility of AnkiDroid with the intuitive confidence-based learning experience of Brainscape.**

[![Live Demo](https://img.shields.io/badge/Live_Demo-GitHub_Pages-2ea44f?style=for-the-badge)](https://msadegh07.github.io/FlashMind/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Active_Development-orange?style=for-the-badge)](#optimization-roadmap)

👉 **Try the live web app directly in your browser (no installation required):** **[https://msadegh07.github.io/FlashMind/](https://msadegh07.github.io/FlashMind/)**

---

## 📖 Overview

Learners using digital flashcards often face a trade-off between **customization** and **usability**:
- **Anki / AnkiDroid** offers unmatched spaced-repetition scheduling and open deck ecosystems, but suffers from a steep learning curve and dated interface friction.
- **Brainscape** delivers a clean, motivating, confidence-based study flow (rating mastery from 1 to 5), but is proprietary, closed-source, and locks core features behind paywalls.

**FlashMind** bridges this gap. Built as a lightweight, zero-install Progressive/Web application hosted on GitHub Pages, FlashMind brings Brainscape-style confidence-based active recall together with Anki-inspired deck management and spaced-repetition mechanics—completely free and open source.

---

## ⚖️ How FlashMind Compares

| Dimension | Anki / AnkiDroid | Brainscape | FlashMind |
| :--- | :--- | :--- | :--- |
| **Licensing & Access** | Open Source (GPL/AGPL) | Proprietary / Freemium | **100% Open Source (MIT)** |
| **Platform & Setup** | Desktop & Mobile apps required | Web & Mobile apps | **Instant Web App (Zero Install)** |
| **Review UX** | Traditional 4-button intervals | Confidence-based rating (1–5) | **Confidence-based + SRS hybrid** |
| **Deck Flexibility** | High customization & portability | Structured, rigid hierarchy | **Flexible & portable decks** |
| **Onboarding Friction** | Steep learning curve | Smooth & intuitive | **Clean, fast, distraction-free** |

---

## ✨ Key Features

- **Confidence-Based Active Recall:** Rate how well you know each concept on a granular confidence scale so weak cards resurface faster while mastered concepts space out automatically.
- **Hybrid Spaced Repetition Engine:** Combines immediate session reinforcement with long-term retention intervals.
- **Instant Browser Access:** Runs directly via [GitHub Pages](https://msadegh07.github.io/FlashMind/) across desktop and mobile browsers without account lock-in.
- **Deck & Card Management:** Create, organize, edit, and review custom flashcard decks with clean keyboard- and touch-friendly controls.
- **Lightweight Client-Side Architecture:** Fast load times and responsive study sessions designed for daily habit building.

---

## 📸 Screenshots

> *Tip: Replace these placeholders with 1–2 screenshots of your study screen and deck dashboard.*

```text
[ Add screenshot of the Main Study Interface & Confidence Rating Bar here ]
[ Add screenshot of the Deck Library & Progress Overview here ]
```

---

## 🚀 Running Locally

Because FlashMind is built as a lightweight web application, getting a local copy running takes seconds:

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/msadegh07/FlashMind.git](https://github.com/msadegh07/FlashMind.git)
   cd FlashMind
   ```
2. **Launch locally:**
   Open `index.html` directly in your browser, or serve the directory using any local static server:
   ```bash
   # Using Python
   python -m http.server 8080
   ```
   Then visit `http://localhost:8080`.

---

## 🗺️ Optimization Roadmap

FlashMind is under active development. Below are the core architectural and UX optimizations currently planned and in progress:

- [x] Core hybrid study engine combining confidence-based rating with spaced repetition
- [x] Live deployment on GitHub Pages
- [ ] **Enhanced SRS Scheduling Algorithm:** Adaptive interval tuning inspired by FSRS / SM-2 optimizations for higher long-term retention accuracy
- [ ] **Anki Interoperability (`.apkg` / `.csv`):** Seamless import and export support to migrate existing AnkiDroid decks effortlessly
- [ ] **Offline-First PWA & Sync:** Full offline caching via Service Workers and optional lightweight backup/sync across devices
- [ ] **Rich Card Formatting:** Support for Markdown, code syntax highlighting, LaTeX math formulas, and audio/image occlusion
- [ ] **Study Analytics & Heatmaps:** Visual mastery breakdowns, retention curves, and daily streak tracking
- [ ] **Performance & Accessibility:** Keyboard shortcuts for power users, mobile gesture controls, and bundle/rendering optimizations

---

## 🤝 Contributing

Contributions, bug reports, and feature ideas are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-optimization`)
3. Commit your changes (`git commit -m "Add amazing optimization"`)
4. Push to the branch (`git push origin feature/amazing-optimization`)
5. Open a Pull Request

Feel free to open an [Issue](https://github.com/msadegh07/FlashMind/issues) to discuss new ideas for the spaced-repetition engine or UI improvements.

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.
