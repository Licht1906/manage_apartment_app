const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { sql, config } = require('../config/db');

// Lấy toàn bộ nhân khẩu
router.get('/', auth, async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request().query('SELECT * FROM NhanKhau');
        res.json(result.recordset);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Lấy nhân khẩu theo mã
router.get('/:id', auth, async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('id', sql.NVarChar, req.params.id)
            .query('SELECT * FROM NhanKhau WHERE MaNhanKhau = @id');

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy nhân khẩu' });
        }

        res.json(result.recordset[0]);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Thêm nhân khẩu
router.post("/", auth, async (req, res) => {
    try {
        const {
            HoTen, CanCuocCongDan, NgaySinh,
            NoiSinh, DanToc, NgheNghiep,
            QuanHe, MaHoKhau, GhiChu
        } = req.body;

        let pool = await sql.connect(config);

        const rs = await pool.request()
            .input("HoTen", sql.NVarChar, HoTen)
            .input("CCCD", sql.NVarChar, CanCuocCongDan)
            .input("NgaySinh", sql.Date, NgaySinh)
            .input("NoiSinh", sql.NVarChar, NoiSinh)
            .input("DanToc", sql.NVarChar, DanToc)
            .input("NgheNghiep", sql.NVarChar, NgheNghiep)
            .input("QuanHe", sql.NVarChar, QuanHe || null)
            .input("MaHoKhau", sql.NVarChar, MaHoKhau || null)
            .input("GhiChu", sql.NVarChar, GhiChu || null)
            .query(`
                INSERT INTO NhanKhau (
                    MaHoKhau, HoTen, CanCuocCongDan, NgaySinh,
                    NoiSinh, DanToc, NgheNghiep, QuanHe, GhiChu
                )
                OUTPUT INSERTED.MaNhanKhau
                VALUES (
                    @MaHoKhau, @HoTen, @CCCD, @NgaySinh,
                    @NoiSinh, @DanToc, @NgheNghiep,
                    @QuanHe, @GhiChu
                )
            `);

        res.json({
            message: "Thêm nhân khẩu thành công!",
            MaNhanKhau: rs.recordset[0].MaNhanKhau
        });

    } catch (err) {
        console.log("Create NK error:", err);
        res.status(500).json({ error: "DB Error" });
    }
});

// Cập nhật nhân khẩu
router.put('/:id', auth, async (req, res) => {
    const { HoTen, NgaySinh, GioiTinh, QuanHeVoiChuHo, SoCCCD, NgayCap, NoiCap } = req.body;

    try {
        let pool = await sql.connect(config);
        await pool.request()
            .input('MaNhanKhau', sql.NVarChar, req.params.id)
            .input('HoTen', sql.NVarChar, HoTen)
            .input('NgaySinh', sql.Date, NgaySinh)
            .input('GioiTinh', sql.NVarChar, GioiTinh)
            .input('QuanHeVoiChuHo', sql.NVarChar, QuanHeVoiChuHo)
            .input('SoCCCD', sql.NVarChar, SoCCCD)
            .input('NgayCap', sql.Date, NgayCap)
            .input('NoiCap', sql.NVarChar, NoiCap)
            .query(`
                UPDATE NhanKhau SET
                    HoTen = @HoTen,
                    NgaySinh = @NgaySinh,
                    GioiTinh = @GioiTinh,
                    QuanHeVoiChuHo = @QuanHeVoiChuHo,
                    SoCCCD = @SoCCCD,
                    NgayCap = @NgayCap,
                    NoiCap = @NoiCap
                WHERE MaNhanKhau = @MaNhanKhau
            `);

        res.json({ message: 'Cập nhật nhân khẩu thành công' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Xoá nhân khẩu
router.delete('/:id', auth, async (req, res) => {
    try {
        let pool = await sql.connect(config);
        await pool.request()
            .input('id', sql.NVarChar, req.params.id)
            .query('DELETE FROM NhanKhau WHERE MaNhanKhau = @id');

        res.json({ message: 'Xoá nhân khẩu thành công' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// GET /nhankhau/search/:keyword
router.get("/search/:keyword", auth, async (req, res) => {
    try {
        const kw = `%${req.params.keyword}%`;

        let pool = await sql.connect(config);

        const rs = await pool.request()
            .input("kw", sql.NVarChar, kw)
            .query(`
                SELECT *
                FROM NhanKhau
                WHERE HoTen LIKE @kw
                   OR CanCuocCongDan LIKE @kw
            `);

        res.json(rs.recordset);
    } catch (err) {
        console.log("Search NK error:", err);
        res.status(500).json({ error: "DB error" });
    }
});

module.exports = router;
