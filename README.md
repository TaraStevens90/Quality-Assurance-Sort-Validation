# 🐺 QA Wolf Take‑Home Assignment — Sort Validation  
**Prepared by:** Tara Stevens  
**Date:** May 2026  

---

## 🎯 Overview
This project validates that the first 100 articles on [Hacker News](https://news.ycombinator.com/newest) are correctly sorted from **newest to oldest**.  
It uses **Playwright** for browser automation and **Express** for serving a lightweight UI that displays the results.

The goal is to demonstrate **QA engineering thoughtfulness** — combining automation, error handling, and clear reporting for reproducible validation.

---

## 🧩 Project Structure
| File | Purpose |
|------|----------|
| `index.js` | Playwright script that scrapes Hacker News, validates sorting, and generates `articles.json` + `report.txt`. |
| `server.js` | Express server that runs the validation script and renders results in a browser. |
| `index.html` | Minimal front‑end interface with a “Run Validation” button. |
| `articles.json` | Auto‑generated data file containing all 100 articles (UI displays 10 for visual validation). |
| `report.txt` | Summary report with timestamp, execution time, and validation results. |
| `package.json` | Node dependencies and project metadata. |
| `.gitignore` | Excludes unnecessary files (like `node_modules`) from version control. |

---

## ⚙️ Installation & Setup
1. **Clone or unzip** the project folder.  
2. Open it in **VS Code**.  
3. Run the following commands:
   ```bash
   npm install
   node server.js
   ```
4. Open your browser and go to:
    http://localhost:3000

---

## 🚀 How It Works
Click **Run Validation** in the browser.

The server executes `index.js` using Playwright:

- Launches Chromium (non‑headless for visual QA).  
- Collects 100 articles from Hacker News.  
- Validates chronological order.  
- Saves all 100 articles and a summary report.

The results page displays:

- A **table** showing the first 10 articles for visual validation.  
- A **“Run Again”** button to re‑trigger validation.  
- A **styled summary report** with timestamps, execution time, and sort status.

---

## 🧠 QA Highlights
**Error Handling:**
- Graceful fallback for missing data (`(no title)`, `(no age)`).  
- Conditional screenshot capture only on failed validation.  
- `try / catch / finally` ensures browser closure even on errors.

**Enhancements:**
- Color‑coded console output for quick triage.  
- JSON + TXT reporting for traceability.  
- Alternating row shading and “Run Again” button for usability.  

**Testing Flow:**
- Transparent automation → visible validation → documented results.  
- Built for reproducibility and auditability — core QA principles.

---

## 🧹 Cleanup (Optional)
After submission:

- Delete `articles.json` and `report.txt` to reset the project.  
- Remove `node_modules` for a smaller zip (reinstall later with `npm install`).  
- Keep all core files (`index.js`, `server.js`, `index.html`, `package.json`).

---

## 🏁 Outcome
A functional QA validation environment demonstrating:

- Automation precision  
- Error resilience  
- Clear reporting  
- Professional presentation  

This project reflects a **QA engineer’s mindset** — intentional, traceable, and built for both automation and human validation.

