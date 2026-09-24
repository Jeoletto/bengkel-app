const db = require('../config/db');

// 1. Pengajuan Permintaan Bahan Kerja (Oleh Mahasiswa)
exports.ajukanPermintaan = async (req, res) => {
  const user_id = req.user.id; // Ambil dari token JWT
  const { keperluan, items } = req.body; 
  // items berisi array: [{ material_id: 1, jumlah: 5 }]

  try {
    const kode_transaksi = 'MAT-' + Date.now();

    await db.query('START TRANSACTION');

    // Insert ke tabel utama material_requests
    const [requestResult] = await db.query(
      `INSERT INTO material_requests (kode_transaksi, user_id, keperluan, status) 
       VALUES (?, ?, ?, 'pending')`,
      [kode_transaksi, user_id, keperluan]
    );

    const requestId = requestResult.insertId;

    // Insert detail bahan ke material_request_items
    for (let item of items) {
      await db.query(
        'INSERT INTO material_request_items (material_request_id, material_id, jumlah) VALUES (?, ?, ?)',
        [requestId, item.material_id, item.jumlah]
      );
    }

    await db.query('COMMIT');

    res.status(201).json({
      message: 'Pengajuan permintaan bahan kerja berhasil dibuat!',
      kode_transaksi,
      request_id: requestId
    });

  } catch (error) {
    await db.query('ROLLBACK');
    res.status(500).json({ message: 'Gagal membuat pengajuan bahan kerja', error: error.message });
  }
};

// 2. Persetujuan / Penolakan Admin
exports.approvePermintaan = async (req, res) => {
  const { id } = req.params;
  const { status, catatan_admin } = req.body; // status: 'approved' atau 'rejected'

  try {
    await db.query(
      'UPDATE material_requests SET status = ?, catatan_admin = ? WHERE id = ?',
      [status, catatan_admin || null, id]
    );

    res.json({ message: `Status permintaan bahan berhasil diperbarui menjadi ${status}!` });
  } catch (error) {
    res.status(500).json({ message: 'Gagal memperbarui status permintaan', error: error.message });
  }
};

// 3. Scan QR Penyerahan Bahan (Potong Stok Material Permanen)
exports.scanPenyerahan = async (req, res) => {
  const { kode_transaksi } = req.body;

  try {
    const [requests] = await db.query('SELECT * FROM material_requests WHERE kode_transaksi = ?', [kode_transaksi]);
    if (requests.length === 0) {
      return res.status(404).json({ message: 'Transaksi permintaan bahan tidak ditemukan!' });
    }

    const request = requests[0];
    if (request.status !== 'approved') {
      return res.status(400).json({ message: 'Permintaan bahan belum disetujui admin atau sudah diserahkan!' });
    }

    const [items] = await db.query('SELECT * FROM material_request_items WHERE material_request_id = ?', [request.id]);

    // Potong stok material secara permanen
    for (let item of items) {
      await db.query('UPDATE materials SET stok = stok - ? WHERE id = ?', [item.jumlah, item.material_id]);
    }

    // Catat timestamp penyerahan real
    await db.query(
      'UPDATE material_requests SET status = "completed", waktu_penyerahan_real = NOW() WHERE id = ?',
      [request.id]
    );

    res.json({ message: 'Scan QR Penyerahan berhasil! Stok bahan kerja telah diperbarui (berkurang).' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal memproses penyerahan bahan kerja', error: error.message });
  }
};