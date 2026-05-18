// QA Wolf Take‑Home Assignment: Question 1 — Prepared by Tara Stevens
// Express server that runs the Playwright validation script and displays results in a clean HTML interface.
// Enhancements include alternating row shading, a “Run Again” button, and styled summary report section.

// Set up an Express server that can run the Playwright validation script and serve results on port 3000.
const express = require("express");
const { exec } = require("child_process");
const fs = require("fs");

const app = express();
const PORT = 3000;

// Define routes: the root serves the main HTML page, and /run-validation triggers the Playwright test and returns results.
// Root route — serves the main HTML interface.
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Validation route — executes the Playwright script and returns formatted results.
app.get("/run-validation", (req, res) => {
  exec("node index.js", (error, stdout, stderr) => {
    if (error) {
      return res.send(`
        <pre style="color:red;">
          Error: ${error.message}
        </pre>
      `);
    }

    // Read the generated summary report.
    const report = fs.readFileSync("report.txt", "utf8");

// Load all articles from JSON, then slice to show only the first 10
let articles = [];
try {
  const allArticles = JSON.parse(fs.readFileSync("articles.json", "utf8"));
  articles = allArticles.slice(0, 10); // ✅ Only display first 10
} catch (e) {
  console.warn(e.message);
}

// Build the HTML table dynamically from JSON data.
const tableHTML = `
  <table border="1" cellpadding="6" style="border-collapse:collapse;">
    <tr>
      <th>#</th>
      <th>Title</th>
      <th>Age</th>
      <th>Link</th>
    </tr>
    ${articles
      .map(
        (a, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${a.title}</td>
            <td>${a.age}</td>
            <td><a href="${a.url}" target="_blank">Open</a></td>
          </tr>`
      )
      .join("")}
  </table>
`;

    // Send the complete HTML response.
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <title>QA Wolf Validation</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 40px;
              background: #f9f9f9;
              color: #333;
            }
            h1 {
              margin-bottom: 10px;
            }
            table {
              width: 100%;
              margin-bottom: 20px;
            }
            th {
              background: #007bff;
              color: white;
            }
            td, th {
              text-align: left;
              padding: 6px;
            }
            /* Alternating row shading for readability */
            tr:nth-child(even) {
              background-color: #f2f2f2;
            }
            /* Styled summary report wrapper */
            .report {
              background: #fff;
              padding: 15px;
              border-radius: 6px;
              box-shadow: 0 0 5px rgba(0,0,0,0.1);
              margin-top: 20px;
            }
            pre {
              white-space: pre-wrap;
              font-size: 14px;
            }
            /* Run Again button styling */
            .run-again {
              padding: 10px 20px;
              font-size: 16px;
              cursor: pointer;
              border: none;
              background: #007bff;
              color: white;
              border-radius: 6px;
              margin-bottom: 20px;
            }
            .run-again:hover {
              background: #0056b3;
            }
          </style>
        </head>

        <body>
          <h1>QA Wolf Sort Validation</h1>
          <!-- Run Again button to allow re-triggering validation without returning to root -->
          <button class="run-again" onclick="window.location.href='/run-validation'">Run Again</button>

          <p style="font-size:16px; margin-bottom:10px; color:#444;">
            Displaying first 10 articles for visual validation from newest to oldest:
          </p>

          ${tableHTML}

          <!-- Summary report wrapped for visual separation -->
          <div class="report">
            <h3>Summary Report</h3>
            <pre>${report}</pre>
          </div>
        </body>
      </html>
    `);
  });
});

// Server startup — binds to localhost for reliable local testing.
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
