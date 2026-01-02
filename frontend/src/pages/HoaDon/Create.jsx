import { useState } from "react";
import { Button, Input, Form, Modal, Table, Space, InputNumber, message, DatePicker } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import axiosClient from "../../api/axiosClient";

export default function HoaDonCreate({ open, onClose, reload }) {
    const [form] = Form.useForm();
    const [items, setItems] = useState([]);

    const addItem = () => setItems([...items, { TenKhoanThu: "", SoTien: 0 }]);
    const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));

    const submit = async () => {
        try {
            const values = await form.validateFields();

            if (items.length === 0)
                return message.error("Phải có ít nhất 1 khoản thu!");

            const payload = {
                MaHoKhau: values.MaHoKhau,
                Items: items
            };

            // Nếu có chọn ngày → gửi lên
            if (values.NgayTao) {
                payload.NgayTao = values.NgayTao.format("YYYY-MM-DD");
            }

            await axiosClient.post("/hoadon", payload);

            message.success("Tạo hóa đơn thành công!");
            onClose();
            reload();
            form.resetFields();
            setItems([]);

        } catch {
            message.error("Không thể tạo hóa đơn");
        }
    };


    return (
        <Modal
            open={open}
            onCancel={onClose}
            destroyOnClose
            onOk={submit}
            title="Tạo hóa đơn"
            width={700}
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    label="Mã hộ khẩu"
                    name="MaHoKhau"
                    rules={[{ required: true, message: "Nhập mã hộ khẩu" }]}
                >
                    <Input placeholder="Ví dụ: HK001" />
                </Form.Item>

                <Form.Item
                    label="Ngày tạo hóa đơn"
                    name="NgayTao"
                >
                    <DatePicker
                        style={{ width: "100%" }}
                        format="YYYY-MM-DD"
                        placeholder="Để trống = hôm nay"
                    />
                </Form.Item>


                <h3>Khoản thu</h3>
                <Button type="dashed" icon={<PlusOutlined />} onClick={addItem}>
                    Thêm khoản thu
                </Button>

                <Table
                    dataSource={items}
                    rowKey={(_, i) => i}
                    pagination={false}
                    style={{ marginTop: 10 }}
                    columns={[
                        {
                            title: "Tên khoản thu",
                            render: (_, r, i) => (
                                <Input
                                    value={r.TenKhoanThu}
                                    onChange={(e) => {
                                        const arr = [...items];
                                        arr[i].TenKhoanThu = e.target.value;
                                        setItems(arr);
                                    }}
                                />
                            )
                        },
                        {
                            title: "Số tiền",
                            render: (_, r, i) => (
                                <InputNumber
                                    min={0}
                                    style={{ width: "100%" }}
                                    value={r.SoTien}
                                    onChange={(v) => {
                                        const arr = [...items];
                                        arr[i].SoTien = v;
                                        setItems(arr);
                                    }}
                                />
                            )
                        },
                        {
                            title: "",
                            render: (_, __, i) => (
                                <Button
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => removeItem(i)}
                                />
                            )
                        }
                    ]}
                />
            </Form>
        </Modal>
    );
}
