import { useEffect, useState } from "react";
import { Modal, Table, message, Descriptions } from "antd";
import axiosClient from "../../api/axiosClient";
import dayjs from "dayjs";

export default function HoaDonDetail({ id, onClose }) {
    const [data, setData] = useState(null);

    const load = async () => {
        try {
            const res = await axiosClient.get(`/hoadon/${id}`);
            setData(res.data);
        } catch {
            message.error("Không tải được chi tiết hóa đơn");
        }
    };

    useEffect(() => {
        if (id) load();
    }, [id]);

    return (
        <Modal
            open={true}
            onCancel={onClose}
            title={`Hóa đơn #${id}`}
            width={700}
            footer={null}
            destroyOnClose
        >
            {!data ? (
                "Đang tải..."
            ) : (
                <>
                    <Descriptions bordered column={2} size="small">
                        <Descriptions.Item label="Mã hộ khẩu">
                            {data.info.MaHoKhau}
                        </Descriptions.Item>

                        <Descriptions.Item label="Địa chỉ">
                            {data.info.DiaChi}
                        </Descriptions.Item>

                        <Descriptions.Item label="Ngày tạo">
                            {dayjs(data.info.NgayTao).format("DD/MM/YYYY")}
                        </Descriptions.Item>

                        <Descriptions.Item label="Tổng tiền">
                            <b>{data.info.TongTien.toLocaleString("vi-VN")} ₫</b>
                        </Descriptions.Item>
                    </Descriptions>

                    <h3 style={{ marginTop: 20 }}>Chi tiết khoản thu</h3>

                    <Table
                        dataSource={data.chitiet}
                        rowKey="MaCT"
                        pagination={false}
                        columns={[
                            { title: "Tên khoản thu", dataIndex: "TenKhoanThu" },
                            {
                                title: "Số tiền",
                                dataIndex: "SoTien",
                                render: (v) =>
                                    v.toLocaleString("vi-VN") + " ₫"
                            }
                        ]}
                    />
                </>
            )}
        </Modal>
    );
}
