const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  // 1. Ambil 'email' juga dari req.body
  const { nim_nip, nama, email, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 2. Tambahkan 'email' ke kolom dan placeholder (?, ?, ?, ?, ?)
    await db.query(
      'INSERT INTO users (nim_nip, nama, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [nim_nip, nama, email, hashedPassword, role || 'mahasiswa']
    );
    
    res.status(201).json({ message: 'Registrasi berhasil!' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal meregistrasi user', error: error.message });
  }
};
exports.login = async (req, res) => {
  const { nim_nip, password } = req.body;
  try {
    const [users] = await db.query('SELECT * FROM users WHERE nim_nip = ?', [nim_nip]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan!' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Password salah!' });
    }

    const token = jwt.sign(
      { id: user.id, nama: user.nama, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login berhasil!',
      token,
      user: { id: user.id, nama: user.nama, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal melakukan login', error: error.message });
  }
};