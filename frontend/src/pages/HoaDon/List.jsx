import { useEffect, useState } from "react";
import { Table, Button, Space, Modal, message } from "antd";
import axiosClient from "../../api/axiosClient";
import HoaDonCreate from "./Create";
import HoaDonDetail from "./Detail";
import dayjs from "dayjs";

export default function HoaDonList() {
    const [data, setData] = useState([]);
    const [openCreate, setOpenCreate] = useState(false);
    const [detailId, setDetailId] = useState(null);

    const load = async () => {
        try {
            const res = await axiosClient.get("/hoadon");
            setData(res.data);
        } catch {
            message.error("Không tải được danh sách hóa đơn");
        }
    };

    useEffect(() => {
        load();
    }, []);

    const remove = (id) => {
        Modal.confirm({
            title: "Xóa hóa đơn?",
            onOk: async () => {
                try {
                    await axiosClient.delete(`/hoadon/${id}`);
                    message.success("Đã xóa!");
                    load();
                } catch {
                    message.error("Không thể xóa");
                }
            }
        });
    };

    const columns = [
        { title: "Mã HĐ", dataIndex: "MaHoaDon" },
        { title: "Mã hộ khẩu", dataIndex: "MaHoKhau" },
        { title: "Địa chỉ", dataIndex: "DiaChi" },
        {
            title: "Ngày tạo",
            dataIndex: "NgayTao",
            render: (v) => v ? dayjs(v).format("DD/MM/YYYY") : ""
        },
        {
            title: "Tổng tiền",
            dataIndex: "TongTien",
            render: (v) =>
                v?.toLocaleString("vi-VN") + " ₫"
        },
        {
            title: "Hành động",
            render: (_, r) => (
                <Space>
                    <Button onClick={() => setDetailId(r.MaHoaDon)}>Xem</Button>
                    <Button danger onClick={() => remove(r.MaHoaDon)}>Xóa</Button>
                </Space>
            )
        }
    ];

    return (
        <div>
            <h2>Hóa đơn</h2>

            <Button type="primary" onClick={() => setOpenCreate(true)}>
                Tạo hóa đơn
            </Button>

            <Table
                style={{ marginTop: 20 }}
                rowKey="MaHoaDon"
                columns={columns}
                dataSource={data}
            />

            {openCreate && (
                <HoaDonCreate
                    open={openCreate}
                    onClose={() => setOpenCreate(false)}
                    reload={load}
                />
            )}

            {detailId && (
                <HoaDonDetail
                    id={detailId}
                    onClose={() => setDetailId(null)}
                />
            )}
        </div>
    );
}
