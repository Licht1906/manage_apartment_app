import { useEffect, useState } from "react";
import { Table, Button, Space, Modal, message, Tag} from "antd";
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

    const thanhToan = (id) => {
        Modal.confirm({
            title: "Xác nhận thanh toán?",
            content: "Sau khi thanh toán sẽ không thể chỉnh sửa hoặc xóa hóa đơn.",
            okText: "Thanh toán",
            cancelText: "Hủy",
            onOk: async () => {
                try {
                    await axiosClient.put(`/hoadon/${id}/thanhtoan`);
                    message.success("Thanh toán thành công!");
                    load();
                } catch (err) {
                    message.error(
                        err?.response?.data?.error || "Không thể thanh toán"
                    );
                }
            }
        });
    };

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
                    <Button onClick={() => setDetailId(r.MaHoaDon)}>
                        Xem
                    </Button>

                    {!r.TrangThaiThanhToan && (
                        <Button type="primary" onClick={() => thanhToan(r.MaHoaDon)}>
                            Thanh toán
                        </Button>
                    )}

                    {!r.TrangThaiThanhToan && (
                        <Button danger onClick={() => remove(r.MaHoaDon)}>
                            Xóa
                        </Button>
                    )}
                </Space>
            )
        },
        {
            title: "Trạng thái",
            dataIndex: "TrangThaiThanhToan",
            render: (v) =>
                v ? (
                    <Tag color="green">Đã thanh toán</Tag>
                ) : (
                    <Tag color="red">Chưa thanh toán</Tag>
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
