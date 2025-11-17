const express = require('express');
const router = express.Router();
const { authorizeRoles } = require('../middleware/auth'); // optional - keep if you use RBAC
const reportController = require('../controllers/reportController');

router.get('/', reportController.getReports);
router.get('/:id', reportController.getReportById);

module.exports = router;
// --- Example in-memory dataset (replace with DB in production) ---
const reports = [];
for (let i = 1; i <= 50000; i++) { // simulate many rows for large export
  reports.push({
    id: i,
    title: `Report ${i}`,
    status: i % 3 === 0 ? 'closed' : 'open',
    category: (i % 2 === 0) ? 'finance' : 'ops',
    date: new Date(2025, 9 + (i % 3), (i % 28) + 1).toISOString().slice(0, 10),
    owner: `user${i % 10}`,
    rows: Math.floor(Math.random() * 1000)
  });
}

// Utility: simple CSV cell escape
function csvEscape(cell) {
  if (cell === null || cell === undefined) return '';
  const s = String(cell);
  if (/[",\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

// Helper: simulate paginated DB fetch
// Replace this with your real DB query with OFFSET/LIMIT or cursor-based pagination
async function fetchReportsChunk({ from, to, status, category, page = 0, pageSize = 1000 }) {
  // simulate async delay (e.g., DB query)
  await new Promise(resolve => setTimeout(resolve, 0));
  // Filter the full list according to params (for demo)
  let filtered = reports;

  if (from) filtered = filtered.filter(r => new Date(r.date) >= new Date(from));
  if (to) filtered = filtered.filter(r => new Date(r.date) <= new Date(to));
  if (status && status.toLowerCase() !== 'all') filtered = filtered.filter(r => r.status.toLowerCase() === status.toLowerCase());
  if (category && category.toLowerCase() !== 'all') filtered = filtered.filter(r => r.category.toLowerCase() === category.toLowerCase());

  const start = page * pageSize;
  const chunk = filtered.slice(start, start + pageSize);
  return {
    rows: chunk,
    isLastPage: start + pageSize >= filtered.length,
    total: filtered.length
  };
}

// --- Existing GET /reports endpoint (unchanged behavior) ---
router.get('/', /*authorizeRoles('admin','report_viewer'),*/ async (req, res) => {
  let filteredReports = [...reports];

  const { from, to, status, category } = req.query;

  // Filter by date range
  if (from) {
    filteredReports = filteredReports.filter(r => new Date(r.date) >= new Date(from));
  }
  if (to) {
    filteredReports = filteredReports.filter(r => new Date(r.date) <= new Date(to));
  }

  // Filter by status
  if (status && status.toLowerCase() !== 'all') {
    filteredReports = filteredReports.filter(r => r.status.toLowerCase() === status.toLowerCase());
  }

  // Filter by category
  if (category && category.toLowerCase() !== 'all') {
    filteredReports = filteredReports.filter(r => r.category.toLowerCase() === category.toLowerCase());
  }

  res.json(filteredReports);
});

// --- New: Export endpoint (streaming CSV, memory-friendly) ---
// GET /reports/export?from=YYYY-MM-DD&to=YYYY-MM-DD&status=open&category=finance&pageSize=1000
router.get('/export', /*authorizeRoles('admin'),*/ async (req, res) => {
  try {
    // Read filters and optional pageSize (default 1000 rows per chunk)
    const { from, to, status, category } = req.query;
    const pageSize = Math.max(100, Math.min(5000, parseInt(req.query.pageSize, 10) || 1000)); // keep reasonable limits

    // Metadata headers for client
    const filename = `reports_export_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.csv`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    // Optional: force no caching
    res.setHeader('Cache-Control', 'no-cache');

    // CSV header row
    const headers = ['id', 'title', 'status', 'category', 'date', 'owner', 'rows'];
    // Write header immediately
    res.write(headers.map(csvEscape).join(',') + '\n');

    // Async generator to fetch pages and yield CSV lines
    async function* rowsGenerator() {
      let page = 0;
      while (true) {
        const { rows, isLastPage } = await fetchReportsChunk({ from, to, status, category, page, pageSize });

        if (!rows || rows.length === 0) {
          break;
        }

        for (const r of rows) {
          // create CSV line
          const line = [
            r.id,
            r.title,
            r.status,
            r.category,
            r.date,
            r.owner,
            r.rows
          ].map(csvEscape).join(',') + '\n';

          yield line;

          // yield back to event loop every few rows to avoid blocking
          // (useful when generating huge outputs)
          // Note: setImmediate via promise allows other tasks to run
          // do this once per 100 rows to balance throughput & responsiveness
        }

        // short yield to event loop between pages
        await new Promise(setImmediate);

        if (isLastPage) break;
        page++;
      }
    }

    // Stream generator output to response while respecting client backpressure
    const iterator = rowsGenerator();

    // Helper function to pump generator to response, respecting res.write() backpressure
    const pump = async () => {
      for await (const chunk of iterator) {
        const ok = res.write(chunk);
        if (!ok) {
          // backpressure: wait for 'drain' before continuing
          await new Promise(resolve => res.once('drain', resolve));
        }
      }
    };

    await pump();

    // End response
    res.end();
  } catch (err) {
    console.error('Export error:', err);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Failed to export reports' });
    } else {
      // If headers already sent, close connection
      try { res.end(); } catch(e) {}
    }
  }
});

module.exports = router;
