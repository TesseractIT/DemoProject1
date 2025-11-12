const express = require('express');
const router = express.Router();
const { authorizeRoles } = require('../middleware/auth'); // ✅ Add this line

// Sample in-memory report data (replace with DB in real project)
const reports = [
  { id: 1, title: 'Finance Report Q1', status: 'open', category: 'finance', date: '2025-11-01' },
  { id: 2, title: 'Ops Report October', status: 'closed', category: 'ops', date: '2025-10-25' },
  { id: 3, title: 'Finance Report Q2', status: 'open', category: 'finance', date: '2025-11-05' },
  { id: 4, title: 'Ops Report November', status: 'open', category: 'ops', date: '2025-11-10' },
];

// ✅ Apply RBAC protection
// Only 'admin' and 'report_viewer' roles can access /reports
router.get('/', authorizeRoles('admin', 'report_viewer'), (req, res) => {
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

module.exports = router;
