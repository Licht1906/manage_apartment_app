const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { sql, config } = require("../config/db");

// ==============================
// LẤY DANH SÁCH XE
// ==============================
router.get("/", auth, async (req, res) => {
    try {
        let pool = await sql.connect(config);

        const result = await pool.request().query(`
            SELECT 
                Xe.MaXe,
                Xe.BienSo,
                Xe.TenXe,
                Xe.MaNhanKhau,
                Xe.MaHoKhau,
                Xe.MaLoaiXe,
                Xe.MoTa,
                LoaiXe.TenLoai,
                LoaiXe.TienThu,
                NhanKhau.HoTen AS TenChuXe
            FROM Xe
            LEFT JOIN LoaiXe ON Xe.MaLoaiXe = LoaiXe.MaLoaiXe
            LEFT JOIN NhanKhau ON Xe.MaNhanKhau = NhanKhau.MaNhanKhau
        `);

        res.json(result.recordset);
    } catch (err) {
        console.log("Lỗi lấy danh sách xe:", err);
        res.status(500).json({ error: "DB error" });
    }
});

// ==============================
// LẤY DANH SÁCH LOẠI XE
// ==============================
router.get("/loaixe/list", auth, async (req, res) => {
    try {
        let pool = await sql.connect(config);
        const result = await pool.request().query(`SELECT * FROM LoaiXe`);
        res.json(result.recordset);
    } catch (err) {
        console.log("Lỗi lấy loại xe:", err);
        res.status(500).json({ error: "DB error" });
    }
});

// ==============================
// THÊM XE
// ==============================
router.post("/", auth, async (req, res) => {
    try {
        const { BienSo, TenXe, MaLoaiXe, MaNhanKhau, MoTa } = req.body;

        let pool = await sql.connect(config);

        // Lấy MaHoKhau từ MaNhanKhau (nếu có)
        let maHoKhau = null;

        if (MaNhanKhau) {
            const hk = await pool.request()
                .input("MaNhanKhau", sql.Int, MaNhanKhau)
                .query(`SELECT MaHoKhau FROM NhanKhau WHERE MaNhanKhau = @MaNhanKhau`);

            if (hk.recordset.length > 0) {
                maHoKhau = hk.recordset[0].MaHoKhau;
            }
        }

        // Insert xe
        await pool.request()
            .input("BienSo", sql.NVarChar, BienSo)
            .input("TenXe", sql.NVarChar, TenXe)
            .input("MaLoaiXe", sql.NVarChar, MaLoaiXe)
            .input("MaNhanKhau", sql.Int, MaNhanKhau || null)
            .input("MaHoKhau", sql.NVarChar, maHoKhau)
            .input("MoTa", sql.NVarChar, MoTa || null)
            .query(`
                INSERT INTO Xe (BienSo, TenXe, MaLoaiXe, MaNhanKhau, MaHoKhau, MoTa)
                VALUES (@BienSo, @TenXe, @MaLoaiXe, @MaNhanKhau, @MaHoKhau, @MoTa)
            `);

        res.json({ message: "Thêm xe thành công!" });
    } catch (err) {
        console.log("Lỗi thêm xe:", err);
        res.status(500).json({ error: "DB error" });
    }
});

// ==============================
// SỬA XE
// ==============================
router.put("/:MaXe", auth, async (req, res) => {
    try {
        const { BienSo, TenXe, MaLoaiXe, MaNhanKhau, MoTa } = req.body;
        const { MaXe } = req.params;

        let pool = await sql.connect(config);

        let maHoKhau = null;

        if (MaNhanKhau) {
            const hk = await pool.request()
                .input("MaNhanKhau", sql.Int, MaNhanKhau)
                .query(`SELECT MaHoKhau FROM NhanKhau WHERE MaNhanKhau = @MaNhanKhau`);

            if (hk.recordset.length > 0) {
                maHoKhau = hk.recordset[0].MaHoKhau;
            }
        }

        await pool.request()
            .input("MaXe", sql.Int, MaXe)
            .input("BienSo", sql.NVarChar, BienSo)
            .input("TenXe", sql.NVarChar, TenXe)
            .input("MaLoaiXe", sql.NVarChar, MaLoaiXe)
            .input("MaNhanKhau", sql.Int, MaNhanKhau || null)
            .input("MaHoKhau", sql.NVarChar, maHoKhau)
            .input("MoTa", sql.NVarChar, MoTa || null)
            .query(`
                UPDATE Xe 
                SET BienSo = @BienSo,
                    TenXe = @TenXe,
                    MaLoaiXe = @MaLoaiXe,
                    MaNhanKhau = @MaNhanKhau,
                    MaHoKhau = @MaHoKhau,
                    MoTa = @MoTa
                WHERE MaXe = @MaXe
            `);

        res.json({ message: "Cập nhật thành công!" });
    } catch (err) {
        console.log("Lỗi cập nhật xe:", err);
        res.status(500).json({ error: "DB error" });
    }
});

// ==============================
// XÓA XE
// ==============================
router.delete("/:MaXe", auth, async (req, res) => {
    try {
        let pool = await sql.connect(config);

        await pool.request()
            .input("MaXe", sql.Int, req.params.MaXe)
            .query(`DELETE FROM Xe WHERE MaXe = @MaXe`);

        res.json({ message: "Xóa thành công!" });
    } catch (err) {
        console.log("Lỗi xóa xe:", err);
        res.status(500).json({ error: "DB error" });
    }
});

module.exports = router;
