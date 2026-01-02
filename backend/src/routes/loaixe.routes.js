const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { sql, config } = require('../config/db');

// Lấy tất cả loại xe
router.get('/', auth, async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request().query('SELECT * FROM LoaiXe');
        res.json(result.recordset);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Thêm loại xe
router.post('/', auth, async (req, res) => {
    const { MaLoaiXe, TenLoaiXe, DonGia } = req.body;

    try {
        let pool = await sql.connect(config);
        await pool.request()
            .input('MaLoaiXe', sql.NVarChar, MaLoaiXe)
            .input('TenLoaiXe', sql.NVarChar, TenLoaiXe)
            .input('DonGia', sql.Int, DonGia)
            .query(`
                INSERT INTO LoaiXe (MaLoaiXe, TenLoaiXe, DonGia)
                VALUES (@MaLoaiXe, @TenLoaiXe, @DonGia)
            `);

        res.json({ message: 'Thêm loại xe thành công' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Sửa loại xe
router.put('/:id', auth, async (req, res) => {
    const { TenLoaiXe, DonGia } = req.body;

    try {
        let pool = await sql.connect(config);
        await pool.request()
            .input('MaLoaiXe', sql.NVarChar, req.params.id)
            .input('TenLoaiXe', sql.NVarChar, TenLoaiXe)
            .input('DonGia', sql.Int, DonGia)
            .query(`
                UPDATE LoaiXe
                SET TenLoaiXe = @TenLoaiXe, DonGia = @DonGia
                WHERE MaLoaiXe = @MaLoaiXe
            `);

        res.json({ message: 'Cập nhật thành công' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Xoá loại xe
router.delete('/:id', auth, async (req, res) => {
    try {
        let pool = await sql.connect(config);
        await pool.request()
            .input('id', sql.NVarChar, req.params.id)
            .query('DELETE FROM LoaiXe WHERE MaLoaiXe = @id');

        res.json({ message: 'Xóa thành công' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Database error' });
    }
});

module.exports = router;
