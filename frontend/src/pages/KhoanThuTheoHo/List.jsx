import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Select, InputNumber, DatePicker, Space, message } from "antd";
import axiosClient from "../../api/axiosClient";
import dayjs from "dayjs";

export default function KhoanThuTheoHoList() {
    const [data, setData] = useState([]);
    const [hoKhau, setHoKhau] = useState([]);
    const [khoanThu, setKhoanThu] = useState([]);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form] = Form.useForm();

    const loadData = async () => {
        try {
            const res = await axiosClient.get("/khoanthu-theo-ho");
            setData(res.data);

            const hk = await axiosClient.get("/hokhau");
            setHoKhau(hk.data);

            const kt = await axiosClient.get("/khoanthu");
            setKhoanThu(kt.data);

        } catch (err) {
            message.error("Không tải được dữ liệu!");
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            values.NgayApDung = values.NgayApDung.format("YYYY-MM-DD");

            if (editing) {
                await axiosClient.put(`/khoanthu-theo-ho/${editing.Id}`, values);
                message.success("Cập nhật thành công!");
            } else {
                await axiosClient.post(`/khoanthu-theo-ho`, values);
                message.success("Thêm thành công!");
            }

            setOpen(false);
            form.resetFields();
            setEditing(null);
            loadData();

        } catch (err) {
            message.error("Có lỗi xảy ra!");
        }
    };

    const handleDelete = (id) => {
        Modal.confirm({
            title: "Xóa khoản thu này khỏi hộ?",
            onOk: async () => {
                try {
                    await axiosClient.delete(`/khoanthu-theo-ho/${id}`);
                    message.success("Đã xóa!");
                    loadData();
                } catch {
                    message.error("Không thể xóa!");
                }
            }
        });
    };

    const columns = [
        { title: "Hộ khẩu", dataIndex: "MaHoKhau" },
        { title: "Khoản thu", dataIndex: "TenKhoanThu" },
        { title: "Số tiền", dataIndex: "SoTien" },
        { title: "Ngày áp dụng", dataIndex: "NgayApDung" },

        {
            title: "Hành động",
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        onClick={() => {
                            setEditing(record);
                            form.setFieldsValue({
                                ...record,
                                NgayApDung: dayjs(record.NgayApDung)
                            });
                            setOpen(true);
                        }}
                    >
                        Sửa
                    </Button>

                    <Button danger onClick={() => handleDelete(record.Id)}>
                        Xóa
                    </Button>
                </Space>
            )
        }
    ];

    return (
        <div>
            <h2>Khoản thu theo hộ</h2>

            <Button
                type="primary"
                style={{ marginBottom: 20 }}
                onClick={() => {
                    form.resetFields();
                    setEditing(null);
                    setOpen(true);
                }}
            >
                Thêm khoản thu vào hộ khẩu
            </Button>

            <Table
                bordered
                columns={columns}
                dataSource={data}
                rowKey="Id"
            />

            <Modal
                open={open}
                title={editing ? "Sửa khoản thu" : "Thêm khoản thu"}
                onCancel={() => setOpen(false)}
                onOk={handleSubmit}
            >
                <Form form={form} layout="vertical">

                    <Form.Item name="MaHoKhau" label="Hộ khẩu" rules={[{ required: true }]}>
                        <Select>
                            {hoKhau.map(hk => (
                                <Select.Option key={hk.MaHoKhau} value={hk.MaHoKhau}>
                                    {hk.MaHoKhau} - {hk.DiaChiThuongTru}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="MaKhoanThu" label="Khoản thu" rules={[{ required: true }]}>
                        <Select>
                            {khoanThu.map(kt => (
                                <Select.Option key={kt.MaKhoanThu} value={kt.MaKhoanThu}>
                                    {kt.TenKhoanThu}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="SoTien" label="Số tiền" rules={[{ required: true }]}>
                        <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>

                    <Form.Item name="NgayApDung" label="Ngày áp dụng" rules={[{ required: true }]}>
                        <DatePicker style={{ width: "100%" }} />
                    </Form.Item>

                </Form>
            </Modal>
        </div>
    );
}
