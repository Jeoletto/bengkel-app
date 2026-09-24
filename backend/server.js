const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Folder publik untuk foto kontrol harian
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Seluruh Route API
// Route testing untuk halaman utama
app.get('/', (req, res) => {
  res.send('Server Berhasil nyala!');
});
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/items', require('./routes/itemRoutes'));
app.use('/api/materials', require('./routes/materialRoutes'));
app.use('/api/borrowings', require('./routes/borrowingRoutes'));
app.use('/api/material-requests', require('./routes/materialRequestRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});