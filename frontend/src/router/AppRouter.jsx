import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import AdminLayout from "../components/Layout/AdminLayout";
//import KhoanThuList from "../pages/KhoanThu/List";
//import KhoanThuDetail from "../pages/KhoanThu/Detail";
import ProtectedRoute from "./ProtectedRoute";
import HoKhauList from "../pages/HoKhau/List";
import NhanKhauList from "../pages/NhanKhau/List";
import XeList from "../pages/Xe/List";
//import KhoanThuTheoHoList from "../pages/KhoanThuTheoHo/List";
import HoaDonList from "../pages/HoaDon/List";
import HoaDonCreate from "../pages/HoaDon/Create";
import HoaDonDetail from "../pages/HoaDon/Detail";
import Dashboard from "../pages/Dashboard";
import TamTruList from "../pages/TamTru/List";
import TamTruAdd from "../pages/TamTru/Add";
import TamTruDetail from "../pages/TamTru/Detail";
import TamVangList from "../pages/TamVang/List";
import TamVangAdd from "../pages/TamVang/Add";
import TamVangDetail from "../pages/TamVang/Detail";

export default function AppRouter() {
    return (
        <Routes>

            {/* Redirect mặc định "/" -> "/login" */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
                <Route element={<AdminLayout />}>

                    <Route path="/dashboard" element={<Dashboard />} />
                    {/* <Route path="/khoanthu" element={<KhoanThuList />} /> */}
                    {/* <Route path="/khoanthu/:id" element={<KhoanThuDetail />} /> */}
                    <Route path="/hokhau" element={<HoKhauList />} />
                    <Route path="/nhankhau" element={<NhanKhauList />} />
                    <Route path="/xe" element={<XeList />} />
                    {/* <Route path="/khoanthu-theo-ho" element={<KhoanThuTheoHoList />} /> */}
                    <Route path="/hoadon" element={<HoaDonList />} />
                    <Route path="/hoadon/create" element={<HoaDonCreate />} />
                    <Route path="/hoadon/:id" element={<HoaDonDetail />} />
                    <Route path="/tamtru" element={<TamTruList />} />
                    <Route path="/tamtru/add" element={<TamTruAdd />} />
                    <Route path="/tamtru/:id" element={<TamTruDetail />} />
                    <Route path="/tamvang" element={<TamVangList />} />
                    <Route path="/tamvang/add" element={<TamVangAdd />} />
                    <Route path="/tamvang/:id" element={<TamVangDetail />} />

                </Route>
            </Route>

            {/* Nếu route không khớp -> đưa về login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}
