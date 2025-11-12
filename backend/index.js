const express = require('express');
const app = express();
const reportsRouter = require('./routes/reports');

app.use(express.json());
app.use('/api/reports', reportsRouter);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
