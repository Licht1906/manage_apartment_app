CREATE DATABASE bluemoon_mgmt
COLLATE Latin1_General_100_CI_AI_SC_UTF8;
GO

USE bluemoon_mgmt;
GO

CREATE TABLE HoKhau (
    MaHoKhau        NVARCHAR(10) PRIMARY KEY,
    DiaChiThuongTru NVARCHAR(200) NOT NULL,
    NoiCap          NVARCHAR(200) NOT NULL,
    NgayCap         DATE NOT NULL
);
GO

CREATE TABLE dbo.NhanKhau (
    MaNhanKhau      INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    MaHoKhau        NVARCHAR(10)      NULL,
    HoTen           NVARCHAR(100)     NOT NULL,
    CanCuocCongDan  NVARCHAR(12)      NOT NULL UNIQUE,
    NgaySinh        DATE              NOT NULL,
    NoiSinh         NVARCHAR(100)     NOT NULL,
    DanToc          NVARCHAR(20)      NOT NULL,
    NgheNghiep      NVARCHAR(50)      NOT NULL,
    QuanHe          NVARCHAR(30)      NULL,
    GhiChu          NVARCHAR(200)     NULL,
    TrangThai       INT               NOT NULL DEFAULT 1,

    CONSTRAINT FK_NK_HK FOREIGN KEY (MaHoKhau)
        REFERENCES dbo.HoKhau(MaHoKhau)
);
GO

CREATE TABLE dbo.CanHo (
    MaCanHo   INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    MaHoKhau  NVARCHAR(10)      NOT NULL,
    TenCanHo  NVARCHAR(100)     NOT NULL,
    Tang      NVARCHAR(20)      NOT NULL,
    DienTich  FLOAT             NOT NULL,
    MoTa      NVARCHAR(4000)    NULL,

    CONSTRAINT FK_CH_HK FOREIGN KEY (MaHoKhau)
        REFERENCES dbo.HoKhau(MaHoKhau)
);
GO

CREATE TABLE dbo.LoaiXe (
    MaLoaiXe NVARCHAR(50)  NOT NULL PRIMARY KEY,
    TenLoai  NVARCHAR(100) NOT NULL,
    TienThu INT NOT NULL
);
GO

CREATE TABLE Xe (
    MaXe INT IDENTITY(1,1) PRIMARY KEY,
    BienSo NVARCHAR(20) NOT NULL UNIQUE,
    TenXe NVARCHAR(100) NOT NULL,
    MaLoaiXe NVARCHAR(50) NOT NULL,
    MaNhanKhau INT NULL,        
    MaHoKhau NVARCHAR(10) NULL,          
    MoTa NVARCHAR(4000) NULL
);
GO

ALTER TABLE Xe
ADD CONSTRAINT FK_XE_LOAIXE
FOREIGN KEY (MaLoaiXe) REFERENCES LoaiXe(MaLoaiXe);
GO

ALTER TABLE Xe
ADD CONSTRAINT FK_XE_NhanKhau
FOREIGN KEY (MaNhanKhau) REFERENCES NhanKhau(MaNhanKhau);
GO

INSERT INTO LoaiXe (MaLoaiXe, TenLoai, TienThu)
VALUES
(N'XM', N'Xe máy', 5000),
(N'OTO', N'Ô tô', 20000),
(N'XD', N'Xe đạp', 2000);
GO

CREATE TRIGGER trg_Xe_SetHoKhau
ON Xe
AFTER INSERT
AS
BEGIN
    UPDATE Xe
    SET MaHoKhau = NK.MaHoKhau
    FROM Xe
    JOIN NhanKhau NK ON Xe.MaNhanKhau = NK.MaNhanKhau
    WHERE Xe.MaXe IN (SELECT MaXe FROM Inserted);
END;
GO

CREATE TABLE dbo.KhoanThu (
    MaKhoanThu      INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    TenKhoanThu     NVARCHAR(100)     NOT NULL,
    ThoiGianBatDau  DATE              NOT NULL,
    ThoiGianKetThuc DATE              NOT NULL,
    LoaiKhoanThu    INT               NOT NULL,
    ChiTiet         NVARCHAR(MAX)     NULL,
    GhiChu          NVARCHAR(200)     NULL
);
GO

CREATE TABLE dbo.KhoanThuTheoHo (
    MaKhoanThuTheoHo INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    MaKhoanThu       INT               NOT NULL,
    MaHoKhau         NVARCHAR(10)      NOT NULL,
    SoTien           INT               NOT NULL,

    CONSTRAINT FK_KTTH_KT FOREIGN KEY (MaKhoanThu)
        REFERENCES dbo.KhoanThu(MaKhoanThu),

    CONSTRAINT FK_KTTH_HK FOREIGN KEY (MaHoKhau)
        REFERENCES dbo.HoKhau(MaHoKhau)
);
GO

CREATE TABLE HoaDon (
    MaHoaDon INT IDENTITY(1,1) PRIMARY KEY,
    MaHoKhau NVARCHAR(10) NOT NULL,
    NgayTao DATETIME NOT NULL DEFAULT GETDATE(),
    TongTien INT NOT NULL DEFAULT 0,

    CONSTRAINT FK_HD_HK FOREIGN KEY (MaHoKhau)
        REFERENCES HoKhau(MaHoKhau)
);
GO

CREATE TABLE HoaDonChiTiet (
    MaCT INT IDENTITY(1,1) PRIMARY KEY,
    MaHoaDon INT NOT NULL,
    TenKhoanThu NVARCHAR(100) NOT NULL,
    SoTien INT NOT NULL,

    CONSTRAINT FK_CT_HD FOREIGN KEY (MaHoaDon)
        REFERENCES HoaDon(MaHoaDon)
);
GO

CREATE TABLE dbo.TamTru (
    MaTamTru INT IDENTITY(1,1) PRIMARY KEY,
    MaNhanKhau INT NOT NULL,
    NoiTamTru NVARCHAR(200) NOT NULL,
    TuNgay DATE NOT NULL,
    DenNgay DATE NULL,
    LyDo NVARCHAR(200) NULL,

    CONSTRAINT FK_TT_NK FOREIGN KEY (MaNhanKhau)
        REFERENCES dbo.NhanKhau(MaNhanKhau)
);
GO

CREATE TABLE dbo.TamVang (
    MaTamVang INT IDENTITY(1,1) PRIMARY KEY,
    MaNhanKhau INT NOT NULL,
    NoiDen NVARCHAR(200) NOT NULL,
    TuNgay DATE NOT NULL,
    DenNgay DATE NULL,
    LyDo NVARCHAR(200) NOT NULL,

    CONSTRAINT FK_TV_NK FOREIGN KEY (MaNhanKhau)
        REFERENCES dbo.NhanKhau(MaNhanKhau)
);
GO

CREATE TABLE dbo.Users (
    Id       INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Username NVARCHAR(50)      NOT NULL UNIQUE,
    Password NVARCHAR(255)     NOT NULL,
    Ho       NVARCHAR(50)      NOT NULL,
    Ten      NVARCHAR(50)      NOT NULL,
    Email    NVARCHAR(100)     NOT NULL
);
GO
