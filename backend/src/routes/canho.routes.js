const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { sql, config } = require('../config/db');

// Lấy danh sách căn hộ
router.get('/', auth, async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request().query('SELECT * FROM CanHo');
        res.json(result.recordset);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Lấy 1 căn hộ theo mã
router.get('/:id', auth, async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('id', sql.NVarChar, req.params.id)
            .query('SELECT * FROM CanHo WHERE MaCanHo = @id');

        if (result.recordset.length === 0)
            return res.status(404).json({ error: 'Không tìm thấy căn hộ' });

        res.json(result.recordset[0]);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Thêm căn hộ
router.post('/', auth, async (req, res) => {
    const { MaCanHo, Tang, DienTich, TrangThai, MaHoKhau } = req.body;

    try {
        let pool = await sql.connect(config);
        await pool.request()
            .input('MaCanHo', sql.NVarChar, MaCanHo)
            .input('Tang', sql.Int, Tang)
            .input('DienTich', sql.Float, DienTich)
            .input('TrangThai', sql.NVarChar, TrangThai)
            .input('MaHoKhau', sql.NVarChar, MaHoKhau)
            .query(`
                INSERT INTO CanHo (MaCanHo, Tang, DienTich, TrangThai, MaHoKhau)
                VALUES (@MaCanHo, @Tang, @DienTich, @TrangThai, @MaHoKhau)
            `);

        res.json({ message: 'Thêm căn hộ thành công' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Cập nhật căn hộ
router.put('/:id', auth, async (req, res) => {
    const { Tang, DienTich, TrangThai, MaHoKhau } = req.body;

    try {
        let pool = await sql.connect(config);

        await pool.request()
            .input('MaCanHo', sql.NVarChar, req.params.id)
            .input('Tang', sql.Int, Tang)
            .input('DienTich', sql.Float, DienTich)
            .input('TrangThai', sql.NVarChar, TrangThai)
            .input('MaHoKhau', sql.NVarChar, MaHoKhau)
            .query(`
                UPDATE CanHo SET
                    Tang = @Tang,
                    DienTich = @DienTich,
                    TrangThai = @TrangThai,
                    MaHoKhau = @MaHoKhau
                WHERE MaCanHo = @MaCanHo
            `);

        res.json({ message: 'Cập nhật căn hộ thành công' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Xoá căn hộ
router.delete('/:id', auth, async (req, res) => {
    try {
        let pool = await sql.connect(config);
        await pool.request()
            .input('id', sql.NVarChar, req.params.id)
            .query('DELETE FROM CanHo WHERE MaCanHo = @id');

        res.json({ message: 'Xoá căn hộ thành công' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Database error' });
    }
});

module.exports = router;
