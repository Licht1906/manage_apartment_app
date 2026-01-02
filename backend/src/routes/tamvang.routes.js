const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { sql, config } = require("../config/db");

// ===============================
// GET danh sách tạm vắng
// ===============================
router.get("/", auth, async (req, res) => {
    try {
        let pool = await sql.connect(config);

        const rs = await pool.request().query(`
            SELECT 
                TV.MaTamVang,
                TV.MaNhanKhau,
                NK.HoTen,
                NK.CanCuocCongDan,
                NK.NgaySinh,
                TV.NoiDen,
                TV.TuNgay,
                TV.DenNgay,
                TV.LyDo
            FROM TamVang TV
            JOIN NhanKhau NK ON TV.MaNhanKhau = NK.MaNhanKhau
            ORDER BY TV.MaTamVang DESC
        `);

        res.json(rs.recordset);

    } catch (err) {
        console.log("Get tam vang error:", err);
        res.status(500).json({ error: "DB error" });
    }
});

// ===============================
// GET chi tiết tạm vắng
// ===============================
router.get("/:id", auth, async (req, res) => {
    try {
        let pool = await sql.connect(config);

        const rs = await pool.request()
            .input("id", sql.Int, req.params.id)
            .query(`
                SELECT 
                    TV.*,
                    NK.HoTen,
                    NK.CanCuocCongDan,
                    NK.NgaySinh,
                    NK.NoiSinh,
                    NK.DanToc,
                    NK.NgheNghiep
                FROM TamVang TV
                JOIN NhanKhau NK ON TV.MaNhanKhau = NK.MaNhanKhau
                WHERE TV.MaTamVang = @id
            `);

        res.json(rs.recordset[0]);

    } catch (err) {
        console.log("Detail tam vang error:", err);
        res.status(500).json({ error: "DB error" });
    }
});

// ===============================
// Thêm tạm vắng
// ===============================
router.post("/", auth, async (req, res) => {
    try {
        const { MaNhanKhau, NoiDen, TuNgay, DenNgay, LyDo } = req.body;

        if (!MaNhanKhau)
            return res.status(400).json({ error: "Thiếu mã nhân khẩu" });

        let pool = await sql.connect(config);

        await pool.request()
            .input("MaNhanKhau", sql.Int, MaNhanKhau)
            .input("NoiDen", sql.NVarChar, NoiDen)
            .input("TuNgay", sql.Date, TuNgay)
            .input("DenNgay", sql.Date, DenNgay)
            .input("LyDo", sql.NVarChar, LyDo)
            .query(`
                INSERT INTO TamVang (MaNhanKhau, NoiDen, TuNgay, DenNgay, LyDo)
                VALUES (@MaNhanKhau, @NoiDen, @TuNgay, @DenNgay, @LyDo)
            `);

        res.json({ message: "Đăng ký tạm vắng thành công!" });

    } catch (err) {
        console.log("Add tam vang error:", err);
        res.status(500).json({ error: "DB error" });
    }
});

// ===============================
// Sửa tạm vắng
// ===============================
router.put("/:id", auth, async (req, res) => {
    try {
        const { NoiDen, TuNgay, DenNgay, LyDo } = req.body;

        let pool = await sql.connect(config);

        await pool.request()
            .input("id", sql.Int, req.params.id)
            .input("NoiDen", sql.NVarChar, NoiDen)
            .input("TuNgay", sql.Date, TuNgay)
            .input("DenNgay", sql.Date, DenNgay)
            .input("LyDo", sql.NVarChar, LyDo)
            .query(`
                UPDATE TamVang
                SET NoiDen=@NoiDen, TuNgay=@TuNgay, DenNgay=@DenNgay, LyDo=@LyDo
                WHERE MaTamVang = @id
            `);

        res.json({ message: "Cập nhật tạm vắng thành công!" });

    } catch (err) {
        console.log("Update tam vang error:", err);
        res.status(500).json({ error: "DB error" });
    }
});

// ===============================
// Xóa tạm vắng
// ===============================
router.delete("/:id", auth, async (req, res) => {
    try {
        let pool = await sql.connect(config);

        await pool.request()
            .input("id", sql.Int, req.params.id)
            .query(`DELETE FROM TamVang WHERE MaTamVang = @id`);

        res.json({ message: "Xóa tạm vắng thành công!" });

    } catch (err) {
        console.log("Delete tam vang error:", err);
        res.status(500).json({ error: "DB error" });
    }
});

// ===============================
// Tìm kiếm theo từ khóa
// ===============================
router.get("/search/:kw", auth, async (req, res) => {
    try {
        const kw = `%${req.params.kw}%`;

        let pool = await sql.connect(config);

        const rs = await pool.request()
            .input("kw", sql.NVarChar, kw)
            .query(`
                SELECT 
                    TV.MaTamVang,
                    NK.HoTen,
                    NK.CanCuocCongDan,
                    TV.*
                FROM TamVang TV
                JOIN NhanKhau NK ON TV.MaNhanKhau = NK.MaNhanKhau
                WHERE NK.HoTen LIKE @kw
                   OR NK.CanCuocCongDan LIKE @kw
            `);

        res.json(rs.recordset);

    } catch (err) {
        console.log("Search tam vang error:", err);
        res.status(500).json({ error: "DB error" });
    }
});

module.exports = router;
