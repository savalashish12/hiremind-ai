const path = require('path');

const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use(
  '/uploads',
  express.static(
    path.join(__dirname, '../uploads')
  )
);

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/application', applicationRoutes);

app.get('/', (req, res) => {
  res.send('HireMind AI Backend Running');
});

module.exports = app;