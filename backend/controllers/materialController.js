const db = require('../config/db');

exports.getAllMaterials = async (req, res) => {
  try {
    const [materials] = await db.query('SELECT * FROM materials ORDER BY id DESC');
    res.json(materials);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data material', error: error.message });
  }
};

exports.createMaterial = async (req, res) => {
  const { kode_material, nama_material, satuan, stok_tersedia, lokasi_rak } = req.body;
  try {
    await db.query(
      'INSERT INTO materials (kode_material, nama_material, satuan, stok_tersedia, lokasi_rak) VALUES (?, ?, ?, ?, ?)',
      [kode_material, nama_material, satuan, stok_tersedia, lokasi_rak]
    );
    res.status(201).json({ message: 'Material berhasil ditambahkan!' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menambah material', error: error.message });
  }
};

exports.updateMaterial = async (req, res) => {
  const { id } = req.params;
  const { nama_material, satuan, stok_tersedia, lokasi_rak } = req.body;
  try {
    await db.query(
      'UPDATE materials SET nama_material = ?, satuan = ?, stok_tersedia = ?, lokasi_rak = ? WHERE id = ?',
      [nama_material, satuan, stok_tersedia, lokasi_rak, id]
    );
    res.json({ message: 'Data material berhasil diperbarui!' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengupdate material', error: error.message });
  }
};

exports.deleteMaterial = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM materials WHERE id = ?', [id]);
    res.json({ message: 'Material berhasil dihapus!' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus material', error: error.message });
  }
};