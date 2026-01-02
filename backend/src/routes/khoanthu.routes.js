const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { sql, config } = require('../config/db');

// Lấy tất cả khoản thu
router.get('/', auth, async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request().query('SELECT * FROM KhoanThu');
        res.json(result.recordset);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Lấy khoản thu theo mã
router.get('/:id', auth, async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('id', sql.NVarChar, req.params.id)
            .query('SELECT * FROM KhoanThu WHERE MaKhoanThu = @id');

        if (result.recordset.length === 0)
            return res.status(404).json({ error: 'Không tìm thấy khoản thu' });

        res.json(result.recordset[0]);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Thêm khoản thu
router.post('/', auth, async (req, res) => {
    const { MaKhoanThu, TenKhoanThu, DonGia, ChuKy, GhiChu } = req.body;

    try {
        let pool = await sql.connect(config);
        await pool.request()
            .input('MaKhoanThu', sql.NVarChar, MaKhoanThu)
            .input('TenKhoanThu', sql.NVarChar, TenKhoanThu)
            .input('DonGia', sql.Int, DonGia)
            .input('ChuKy', sql.NVarChar, ChuKy)
            .input('GhiChu', sql.NVarChar, GhiChu)
            .query(`
                INSERT INTO KhoanThu (MaKhoanThu, TenKhoanThu, DonGia, ChuKy, GhiChu)
                VALUES (@MaKhoanThu, @TenKhoanThu, @DonGia, @ChuKy, @GhiChu)
            `);

        res.json({ message: 'Thêm khoản thu thành công' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Cập nhật khoản thu
router.put('/:id', auth, async (req, res) => {
    const { TenKhoanThu, DonGia, ChuKy, GhiChu } = req.body;

    try {
        let pool = await sql.connect(config);
        await pool.request()
            .input('MaKhoanThu', sql.NVarChar, req.params.id)
            .input('TenKhoanThu', sql.NVarChar, TenKhoanThu)
            .input('DonGia', sql.Int, DonGia)
            .input('ChuKy', sql.NVarChar, ChuKy)
            .input('GhiChu', sql.NVarChar, GhiChu)
            .query(`
                UPDATE KhoanThu SET
                    TenKhoanThu = @TenKhoanThu,
                    DonGia = @DonGia,
                    ChuKy = @ChuKy,
                    GhiChu = @GhiChu
                WHERE MaKhoanThu = @MaKhoanThu
            `);

        res.json({ message: 'Cập nhật khoản thu thành công' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Xoá khoản thu
router.delete('/:id', auth, async (req, res) => {
    try {
        let pool = await sql.connect(config);
        await pool.request()
            .input('id', sql.NVarChar, req.params.id)
            .query('DELETE FROM KhoanThu WHERE MaKhoanThu = @id');

        res.json({ message: 'Xóa khoản thu thành công' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Tìm kiếm khoản thu theo từ khóa
router.get('/search/:keyword', auth, async (req, res) => {
    try {
        const keyword = `%${req.params.keyword}%`;

        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('kw', sql.NVarChar, keyword)
            .query(`
                SELECT * FROM KhoanThu
                WHERE TenKhoanThu LIKE @kw
                   OR MaKhoanThu LIKE @kw
            `);

        res.json(result.recordset);

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Database error' });
    }
});

module.exports = router;
