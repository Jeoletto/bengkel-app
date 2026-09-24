const db = require('../config/db');

exports.getAllItems = async (req, res) => {
  try {
    const [items] = await db.query('SELECT * FROM items ORDER BY id DESC');
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data alat', error: error.message });
  }
};

exports.createItem = async (req, res) => {
  const { kode_barang, nama_barang, kategori, stok_total, lokasi_rak } = req.body;
  try {
    await db.query(
      'INSERT INTO items (kode_barang, nama_barang, kategori, stok_total, stok_tersedia, lokasi_rak) VALUES (?, ?, ?, ?, ?, ?)',
      [kode_barang, nama_barang, kategori, stok_total, stok_total, lokasi_rak]
    );
    res.status(201).json({ message: 'Alat berhasil ditambahkan!' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menambah alat', error: error.message });
  }
};

exports.updateItem = async (req, res) => {
  const { id } = req.params;
  const { nama_barang, kategori, stok_total, stok_tersedia, lokasi_rak } = req.body;
  try {
    await db.query(
      'UPDATE items SET nama_barang = ?, kategori = ?, stok_total = ?, stok_tersedia = ?, lokasi_rak = ? WHERE id = ?',
      [nama_barang, kategori, stok_total, stok_tersedia, lokasi_rak, id]
    );
    res.json({ message: 'Data alat berhasil diperbarui!' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengupdate alat', error: error.message });
  }
};

exports.deleteItem = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM items WHERE id = ?', [id]);
    res.json({ message: 'Alat berhasil dihapus!' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus alat', error: error.message });
  }
};