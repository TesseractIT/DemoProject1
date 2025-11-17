// Mock data (replace with DB integration)
const reports = [
  { id: 1, title: 'Finance Report Q1', status: 'open', category: 'finance', date: '2025-11-01' },
  { id: 2, title: 'Ops Report October', status: 'closed', category: 'ops', date: '2025-10-25' },
  { id: 3, title: 'Finance Report Q2', status: 'open', category: 'finance', date: '2025-11-05' },
  { id: 4, title: 'Ops Report November', status: 'open', category: 'ops', date: '2025-11-10' },
];

// Filter and fetch reports
exports.getReports = async ({ from, to, status, category }) => {
  let filtered = [...reports];

  if (from) filtered = filtered.filter(r => new Date(r.date) >= new Date(from));
  if (to) filtered = filtered.filter(r => new Date(r.date) <= new Date(to));
  if (status && status.toLowerCase() !== 'all') filtered = filtered.filter(r => r.status.toLowerCase() === status.toLowerCase());
  if (category && category.toLowerCase() !== 'all') filtered = filtered.filter(r => r.category.toLowerCase() === category.toLowerCase());

  return filtered;
};

// Fetch single report
exports.getReportById = async (id) => {
  return reports.find(r => r.id === parseInt(id));
};
