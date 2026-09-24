const db = require('../config/db');

// 1. Pengajuan Peminjaman Alat
exports.ajukanPeminjaman = async (req, res) => {
  const user_id = req.user.id;
  const { tgl_pinjam_rencana, tgl_kembali_rencana, alasan_pinjam, items } = req.body;

  try {
    const start = new Date(tgl_pinjam_rencana);
    const end = new Date(tgl_kembali_rencana);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const is_multi_day = diffDays > 1;

    if (is_multi_day && !alasan_pinjam) {
      return res.status(400).json({ message: 'Peminjaman multi-day wajib menyertakan alasan keperluan!' });
    }

    const kode_transaksi = 'TRX-' + Date.now();

    await db.query('START TRANSACTION');

    const [borrowResult] = await db.query(
      `INSERT INTO borrowings 
       (kode_transaksi, user_id, tgl_pinjam_rencana, tgl_kembali_rencana, is_multi_day, alasan_pinjam, status) 
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [kode_transaksi, user_id, tgl_pinjam_rencana, tgl_kembali_rencana, is_multi_day, alasan_pinjam || null]
    );

    const borrowingId = borrowResult.insertId;

    for (let item of items) {
      await db.query(
        'INSERT INTO borrowing_items (borrowing_id, item_id, jumlah) VALUES (?, ?, ?)',
        [borrowingId, item.item_id, item.jumlah]
      );
    }

    await db.query('COMMIT');

    res.status(201).json({
      message: 'Pengajuan peminjaman berhasil dibuat!',
      kode_transaksi,
      borrowing_id: borrowingId,
      is_multi_day
    });

  } catch (error) {
    await db.query('ROLLBACK');
    res.status(500).json({ message: 'Gagal membuat pengajuan peminjaman', error: error.message });
  }
};

// 2. Persetujuan / Penolakan Admin
exports.approvePeminjaman = async (req, res) => {
  const { id } = req.params;
  const { status, catatan_admin } = req.body;

  try {
    await db.query(
      'UPDATE borrowings SET status = ?, catatan_admin = ? WHERE id = ?',
      [status, catatan_admin || null, id]
    );

    res.json({ message: `Status peminjaman berhasil diperbarui menjadi ${status}!` });
  } catch (error) {
    res.status(500).json({ message: 'Gagal memperbarui status peminjaman', error: error.message });
  }
};

// 3. Scan QR Pengambilan Alat
exports.scanPickup = async (req, res) => {
  const { kode_transaksi } = req.body;

  try {
    const [borrowings] = await db.query('SELECT * FROM borrowings WHERE kode_transaksi = ?', [kode_transaksi]);
    if (borrowings.length === 0) {
      return res.status(404).json({ message: 'Transaksi peminjaman tidak ditemukan!' });
    }

    const borrowing = borrowings[0];
    if (borrowing.status !== 'approved') {
      return res.status(400).json({ message: 'Transaksi belum disetujui admin atau barang sudah diambil/dikembalikan!' });
    }

    const [items] = await db.query('SELECT * FROM borrowing_items WHERE borrowing_id = ?', [borrowing.id]);

    // Potong stok alat yang dipinjam
    for (let item of items) {
      await db.query('UPDATE items SET stok_tersedia = stok_tersedia - ? WHERE id = ?', [item.jumlah, item.item_id]);
    }

    // ✅ GUNAKAN PLACEHOLDER '?' UNTUK STATUS STATUS "borrowed"
    await db.query(
      'UPDATE borrowings SET status = ?, waktu_diambil_real = NOW() WHERE id = ?',
      ['borrowed', borrowing.id]
    );

    res.json({ message: 'Scan QR Pengambilan berhasil! Alat siap diserahkan ke mahasiswa.' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal memproses pengambilan barang', error: error.message });
  }
};

// 4. Scan QR Pengembalian Alat
exports.scanReturn = async (req, res) => {
  const { kode_transaksi } = req.body;

  try {
    const [borrowings] = await db.query('SELECT * FROM borrowings WHERE kode_transaksi = ?', [kode_transaksi]);
    if (borrowings.length === 0) {
      return res.status(404).json({ message: 'Transaksi peminjaman tidak ditemukan!' });
    }

    const borrowing = borrowings[0];
    if (borrowing.status !== 'borrowed') {
      return res.status(400).json({ message: 'Barang belum diambil atau sudah dikembalikan!' });
    }

    const [items] = await db.query('SELECT * FROM borrowing_items WHERE borrowing_id = ?', [borrowing.id]);

    // Kembalikan stok alat
    for (let item of items) {
      await db.query('UPDATE items SET stok_tersedia = stok_tersedia + ? WHERE id = ?', [item.jumlah, item.item_id]);
    }

    // ✅ GUNAKAN PLACEHOLDER '?' UNTUK STATUS "returned"
    await db.query(
      'UPDATE borrowings SET status = ?, waktu_dikembalikan_real = NOW() WHERE id = ?',
      ['returned', borrowing.id]
    );

    res.json({ message: 'Scan QR Pengembalian berhasil! Stok alat telah diperbarui.' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal memproses pengembalian barang', error: error.message });
  }
};

// 5. Upload Foto Kontrol Harian
exports.uploadDailyPhoto = async (req, res) => {
  const { borrowing_id, catatan_mahasiswa } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: 'Foto kondisi barang wajib diunggah!' });
  }

  const foto_kondisi = req.file.filename;

  try {
    await db.query(
      'INSERT INTO borrowing_daily_photos (borrowing_id, tanggal_upload, foto_kondisi, catatan_mahasiswa) VALUES (?, CURDATE(), ?, ?)',
      [borrowing_id, foto_kondisi, catatan_mahasiswa || null]
    );

    res.status(201).json({ message: 'Foto kontrol harian berhasil diunggah!' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengunggah foto kontrol harian', error: error.message });
  }
};