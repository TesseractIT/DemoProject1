const express = require('express');
const app = express();
const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/reports');

app.use(express.json());

// Mount routes
app.use('/auth', authRoutes);
app.use('/reports', reportRoutes);

// Error handling (optional)
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
