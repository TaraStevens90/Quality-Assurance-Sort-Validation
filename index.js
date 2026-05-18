// QA Wolf Take‑Home Assignment: Question 1 — Prepared by Tara Stevens
// This project validates that the first 100 articles on Hacker News are sorted from newest to oldest.
// It uses Playwright for browser automation and Express for serving a lightweight UI that displays the results.
// The goal is to demonstrate QA engineering thoughtfulness by combining automation, error handling, and clear reporting.

// Import Playwright for browser automation and fs for file handling
const { chromium } = require("playwright");
const fs = require("fs");

async function sortHackerNewsArticles() {
  // Define color codes for terminal output.
  const green = "\x1b[92m";   // green for success
  const red = "\x1b[31m";    // Red for errors
  const yellow = "\x1b[33m"; // Yellow for warnings
  const reset = "\x1b[0m";   // Reset color back to default after each message.

  // Timestamp and metadata for traceability.
  const timestamp = new Date().toLocaleString();
  const user = "Tara Stevens"; // Identifies myself as the QA engineer generating the report.
  const startTime = Date.now(); // Used to calculate total execution time later.

  let browser;

  try {
    // Launch a Chromium browser instance.
    // Headless mode disabled to allow visual validation (optional QA enhancement).
    browser = await chromium.launch({ headless: false });
    const context = await browser.newContext(); // Create a fresh browser (no cookies or cache).
    const page = await context.newPage(); // Open new page

    // Navigate to HackerNews “newest” page with recent submissions.
    await page.goto("https://news.ycombinator.com/newest");

    // Collect articles across multiple pages until we reach 100.
    // The loop is here to demonstrate dynamic data collection and pagination handling.
    let articles = [];

    while (articles.length < 100) {
      // Extract articles from current page with title, age, and url.
      const currentPageArticles = await page.$$eval("tr.athing", rows =>
        rows.map(row => {
          const titleEl = row.querySelector(".titleline a");
          const ageEl = row.nextElementSibling?.querySelector(".age");

          return {
            title: titleEl ? titleEl.innerText : "(no title)",
            age: ageEl ? ageEl.innerText : "(no age)",
            url: titleEl ? titleEl.href : "(no url)"
          };
        })
      );

      // Add page results to master list and log progress in terminal.
      articles.push(...currentPageArticles);
      console.log(`Collected ${articles.length} articles so far...`);

      // Stop at 100 to prevent unnecessary page loads.
      if (articles.length >= 100) break;

      // Click the "More" link to load next page.
      // Using Promise.all ensures both the click and navigation complete before scraping continues.
      await Promise.all([
        page.waitForURL("**/newest?*"),
        page.click(".morelink")
      ]);
    }

    // Trim to exactly 100 articles.
    articles = articles.slice(0, 100);

    // Save all 100 articles to one JSON file for full reference
    fs.writeFileSync("articles.json", JSON.stringify(articles, null, 2));

    // Important: verify that articles are sorted from newest (smallest age) to oldest (largest age).
    // Converts time strings to minutes for numeric comparison.
    const toMinutes = age => {
      const [num, unit] = age.split(" ");
      const value = parseInt(num);
      if (unit.startsWith("minute")) return value; // Examples: "7 minutes ago" = 7
      if (unit.startsWith("hour")) return value * 60; // "2 hours ago" = 120
      if (unit.startsWith("day")) return value * 1440; // "1 day ago" → 1440
      return 0; // Fallback for “just now” or missing values.
    };

    // Map articles to minutes
    const agesInMinutes = articles.map(a => toMinutes(a.age));

    // Articles are considered correctly sorted if timestamps are in ascending order.
    // Equal timestamps are valid — this decision avoids false negatives when multiple posts share the same minute.
    const isSorted = agesInMinutes.every(
      (age, i, arr) => i === 0 || age >= arr[i - 1] - 1
    );


    // Start message and timestamp, added icons to draw attention.
    console.log(`${reset}\n🔍 Starting Hacker News sort validation...`);
    console.log(`🕒 Test executed at: ${timestamp}`);

    // Conditional warning (optional QA safeguard for incomplete data.)
    if (articles.length < 100) {
      console.warn(
        `${yellow}⚠️  Only found ${articles.length} articles — page may not have fully loaded or structure changed.${reset}`
      );
    }

    // Validation section — Description and table of first ten articles for manual QA review.
    console.log(`${reset}\nDisplaying first 10 articles for visual validation from newest to oldest:`);
    console.table(
      articles.slice(0, 10).map(a => ({
        title: a.title,
        age: a.age
      }))
    );

    // Capture a screenshot when sorting fails which provides visual proof for debugging.
    // Note: This avoids unnecessary screenshots when tests pass.
    let screenshotMessage = "Screenshot not captured — sorting passed successfully.";
    if (!isSorted) {
      await page.screenshot({ path: "unsorted_articles.png", fullPage: true });
      screenshotMessage = "Screenshot captured due to failed sort validation."; // Message for report.txt
      console.error(`${red}Screenshot saved for debugging: unsorted_articles.png${reset}`); //Print to terminal
      throw new Error("Articles are not sorted correctly!");
    }

    // Close the browser once validation is complete.
    // This ensures clean resource teardown which is a key QA best practice.
    await browser.close();

    // Footer confirmation when all checks pass.
    console.log(`${green}Validation complete — all checks passed successfully.${reset}`);
    console.log(`${reset}See report.txt for summary details.\n`);

    // Generate and save a summary report.
    // Optional enhancement as structured reporting is good for audits and reproducibility.
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    const warningTrigger = articles.length < 100
      ? "Page may not have fully loaded or structure changed."
      : "No warning triggered.";

    // Structure of summary report
    const summary = `
      Summary Report
      ----------------
      Generated by: ${user}
      Timestamp: ${timestamp}
      Execution time: ${duration} seconds
      Articles checked: ${articles.length}
      Sorted correctly: ${isSorted ? "Yes" : "No"}
      Screenshot captured: ${!isSorted ? "Yes — Sorting failed." : "No — Sorting passed successfully."}
      Warning issued: ${articles.length < 100 ? "Yes — " + warningTrigger : "No"}
      `;

    fs.writeFileSync("report.txt", summary);
 
    // Error handling block.
  } catch (error) {
    // Captures unexpected exceptions (network issues, DOM changes, Playwright errors).
    // Logs them in red for quick triage.
    console.error(`${red} Validation error:${reset}`, error);
  } finally {
    // Guarantee browser closure even if an error occurs.
    // A QA safeguard which prevents resource leaks and ensures clean test teardown.
    if (browser) {
      await browser.close();
    }
  }
}

// Run the test immediately when the script starts.
// Uses an async IIFE so 'await' works at the top level and no manual call is needed.
(async () => {
  await sortHackerNewsArticles();
})();
