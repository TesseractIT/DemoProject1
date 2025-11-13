const reportService = require('../services/reportService');

// Get all reports (with filters)
exports.getReports = async (req, res) => {
  try {
    const { from, to, status, category } = req.query;
    const reports = await reportService.getReports({ from, to, status, category });
    res.status(200).json({ success: true, data: reports });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reports' });
  }
};

// Get single report by ID
exports.getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await reportService.getReportById(id);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    res.status(200).json({ success: true, data: report });
  } catch (error) {
    console.error('Error fetching report by ID:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch report details' });
  }
};

exports.getReports = async (req, res) => {
  try {
    // Simulate DB call
    const reports = [
      { id: 1, title: "Q1 Performance", category: "Finance" },
      { id: 2, title: "System Audit", category: "Operations" },
    ];

    res.json({ reports });
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ message: "Failed to fetch reports" });
  }
};

exports.exportReports = async (req, res) => {
  try {
    // Placeholder for export logic
    res.json({ message: "Export started successfully" });
  } catch (error) {
    console.error("Error exporting reports:", error);
    res.status(500).json({ message: "Failed to export reports" });
  }
};
