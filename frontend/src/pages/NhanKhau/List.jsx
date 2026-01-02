import { useEffect, useState } from "react";
import { Table, Button, Space, Modal, Form, Input, DatePicker, message, Select } from "antd";
import axiosClient from "../../api/axiosClient";
import dayjs from "dayjs";

export default function NhanKhauList() {
    const [data, setData] = useState([]);
    const [hoKhauList, setHoKhauList] = useState([]);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form] = Form.useForm();

    const loadData = async () => {
        try {
            const res = await axiosClient.get("/nhankhau");
            setData(res.data);

            const hk = await axiosClient.get("/hokhau");
            setHoKhauList(hk.data);
        } catch (err) {
            message.error("Lỗi tải dữ liệu!");
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            values.NgaySinh = values.NgaySinh.format("YYYY-MM-DD");

            if (editing) {
                await axiosClient.put(`/nhankhau/${editing.MaNhanKhau}`, values);
                message.success("Cập nhật thành công!");
            } else {
                await axiosClient.post(`/nhankhau`, values);
                message.success("Thêm nhân khẩu thành công!");
            }

            setOpen(false);
            setEditing(null);
            form.resetFields();
            loadData();

        } catch (err) {
            message.error("Lỗi thao tác!");
        }
    };

    const handleDelete = async (id) => {
        Modal.confirm({
            title: "Bạn có chắc muốn xóa nhân khẩu?",
            onOk: async () => {
                try {
                    await axiosClient.delete(`/nhankhau/${id}`);
                    message.success("Xóa thành công!");
                    loadData();
                } catch (err) {
                    message.error("Không thể xóa!");
                }
            }
        });
    };

    const columns = [
        { title: "Mã", dataIndex: "MaNhanKhau" },
        { title: "Họ tên", dataIndex: "HoTen" },
        { title: "CCCD", dataIndex: "CanCuocCongDan" },
        { title: "Ngày sinh", dataIndex: "NgaySinh" },
        { title: "Nơi sinh", dataIndex: "NoiSinh" },
        { title: "Dân tộc", dataIndex: "DanToc" },
        { title: "Nghề nghiệp", dataIndex: "NgheNghiep" },
        { title: "Quan hệ", dataIndex: "QuanHe" },
        { title: "Mã hộ khẩu", dataIndex: "MaHoKhau" },

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
                                NgaySinh: dayjs(record.NgaySinh)
                            });
                            setOpen(true);
                        }}
                    >
                        Sửa
                    </Button>

                    <Button danger onClick={() => handleDelete(record.MaNhanKhau)}>
                        Xóa
                    </Button>
                </Space>
            )
        }
    ];

    return (
        <div>
            <h2>Quản lý nhân khẩu</h2>

            <Button type="primary" style={{ marginBottom: 20 }} onClick={() => setOpen(true)}>
                Thêm nhân khẩu
            </Button>

            <Table columns={columns} dataSource={data} rowKey="MaNhanKhau" bordered />

            <Modal
                title={editing ? "Sửa nhân khẩu" : "Thêm nhân khẩu"}
                open={open}
                onCancel={() => { setOpen(false); setEditing(null); form.resetFields(); }}
                onOk={handleSubmit}
            >
                <Form form={form} layout="vertical">

                    <Form.Item name="HoTen" label="Họ tên" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item name="CanCuocCongDan" label="Số CCCD" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item name="NgaySinh" label="Ngày sinh" rules={[{ required: true }]}>
                        <DatePicker style={{ width: "100%" }} />
                    </Form.Item>

                    <Form.Item name="NoiSinh" label="Nơi sinh" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item name="DanToc" label="Dân tộc" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item name="NgheNghiep" label="Nghề nghiệp" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item name="QuanHe" label="Quan hệ với chủ hộ">
                        <Input />
                    </Form.Item>

                    <Form.Item name="GhiChu" label="Ghi chú">
                        <Input.TextArea rows={2} />
                    </Form.Item>

                    <Form.Item name="MaHoKhau" label="Thuộc hộ khẩu">
                        <Select allowClear>
                            {hoKhauList.map((hk) => (
                                <Select.Option key={hk.MaHoKhau} value={hk.MaHoKhau}>
                                    {hk.MaHoKhau} - {hk.DiaChiThuongTru}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                </Form>
            </Modal>
        </div>
    );
}
