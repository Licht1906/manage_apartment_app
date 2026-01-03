const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { sql, config } = require("../config/db");

// GET HoKhau + CanHo
router.get("/", auth, async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(`
      SELECT hk.*, ch.MaCanHo, ch.TenCanHo, ch.Tang, ch.DienTich, ch.MoTa
      FROM HoKhau hk
      LEFT JOIN CanHo ch ON hk.MaHoKhau = ch.MaHoKhau
    `);

    const map = {};
    result.recordset.forEach(r => {
      if (!map[r.MaHoKhau]) {
        map[r.MaHoKhau] = {
          MaHoKhau: r.MaHoKhau,
          DiaChiThuongTru: r.DiaChiThuongTru,
          NoiCap: r.NoiCap,
          NgayCap: r.NgayCap,
          CanHo: []
        };
      }

      if (r.MaCanHo) {
        map[r.MaHoKhau].CanHo.push({
          MaCanHo: r.MaCanHo,
          TenCanHo: r.TenCanHo,
          Tang: r.Tang,
          DienTich: r.DienTich,
          MoTa: r.MoTa
        });
      }
    });

    res.json(Object.values(map));
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Database error" });
  }
});

// POST HoKhau + CanHo
router.post("/", auth, async (req, res) => {
  const { MaHoKhau, DiaChiThuongTru, NoiCap, NgayCap, CanHo } = req.body;

  const pool = await sql.connect(config);
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    await transaction.request()
      .input("MaHoKhau", sql.NVarChar, MaHoKhau)
      .input("DiaChiThuongTru", sql.NVarChar, DiaChiThuongTru)
      .input("NoiCap", sql.NVarChar, NoiCap)
      .input("NgayCap", sql.Date, NgayCap)
      .query(`
        INSERT INTO HoKhau VALUES
        (@MaHoKhau, @DiaChiThuongTru, @NoiCap, @NgayCap)
      `);

    for (let ch of CanHo || []) {
      await transaction.request()
        .input("MaHoKhau", sql.NVarChar, MaHoKhau)
        .input("TenCanHo", sql.NVarChar, ch.TenCanHo)
        .input("Tang", sql.NVarChar, ch.Tang)
        .input("DienTich", sql.Float, ch.DienTich)
        .input("MoTa", sql.NVarChar, ch.MoTa || null)
        .query(`
          INSERT INTO CanHo (MaHoKhau, TenCanHo, Tang, DienTich, MoTa)
          VALUES (@MaHoKhau, @TenCanHo, @Tang, @DienTich, @MoTa)
        `);
    }

    await transaction.commit();
    res.json({ message: "Thêm thành công" });
  } catch (err) {
    await transaction.rollback();
    console.log(err);
    res.status(500).json({ error: "Database error" });
  }
});

// PUT cập nhật HoKhau + CanHo
router.put("/:id", auth, async (req, res) => {
  const { DiaChiThuongTru, NoiCap, NgayCap, CanHo } = req.body;
  const MaHoKhau = req.params.id;

  const pool = await sql.connect(config);
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    await transaction.request()
      .input("MaHoKhau", sql.NVarChar, MaHoKhau)
      .input("DiaChiThuongTru", sql.NVarChar, DiaChiThuongTru)
      .input("NoiCap", sql.NVarChar, NoiCap)
      .input("NgayCap", sql.Date, NgayCap)
      .query(`
        UPDATE HoKhau
        SET DiaChiThuongTru=@DiaChiThuongTru,
            NoiCap=@NoiCap,
            NgayCap=@NgayCap
        WHERE MaHoKhau=@MaHoKhau
      `);

    await transaction.request()
      .input("MaHoKhau", sql.NVarChar, MaHoKhau)
      .query(`DELETE FROM CanHo WHERE MaHoKhau=@MaHoKhau`);

    for (let ch of CanHo || []) {
      await transaction.request()
        .input("MaHoKhau", sql.NVarChar, MaHoKhau)
        .input("TenCanHo", sql.NVarChar, ch.TenCanHo)
        .input("Tang", sql.NVarChar, ch.Tang)
        .input("DienTich", sql.Float, ch.DienTich)
        .input("MoTa", sql.NVarChar, ch.MoTa || null)
        .query(`
          INSERT INTO CanHo (MaHoKhau, TenCanHo, Tang, DienTich, MoTa)
          VALUES (@MaHoKhau, @TenCanHo, @Tang, @DienTich, @MoTa)
        `);
    }

    await transaction.commit();
    res.json({ message: "Cập nhật thành công" });
  } catch (err) {
    await transaction.rollback();
    res.status(500).json({ error: "Database error" });
  }
});

// DELETE
router.delete("/:id", auth, async (req, res) => {
  const pool = await sql.connect(config);
  await pool.request()
    .input("id", sql.NVarChar, req.params.id)
    .query(`
      DELETE FROM CanHo WHERE MaHoKhau=@id;
      DELETE FROM HoKhau WHERE MaHoKhau=@id;
    `);

  res.json({ message: "Xóa thành công" });
});

module.exports = router;
