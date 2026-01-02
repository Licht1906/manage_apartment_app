import { useEffect, useState } from "react";
import { Form, Input, DatePicker, Button, message } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import dayjs from "dayjs";

export default function TamVangDetail() {
    const { id } = useParams();
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const loadData = async () => {
        try {
            const res = await axiosClient.get(`/tamvang/${id}`);
            form.setFieldsValue({
                ...res.data,
                TuNgay: dayjs(res.data.TuNgay),
                DenNgay: res.data.DenNgay ? dayjs(res.data.DenNgay) : null,
            });
        } catch {
            message.error("Không tải được dữ liệu!");
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const save = async () => {
        try {
            const val = await form.validateFields();

            await axiosClient.put(`/tamvang/${id}`, val);
            message.success("Cập nhật thành công!");
        } catch {
            message.error("Lỗi cập nhật!");
        }
    };

    return (
        <div>
            <h2>Chi tiết tạm vắng</h2>

            <Form form={form} layout="vertical" style={{ maxWidth: 500 }}>
                <Form.Item label="Mã nhân khẩu" name="MaNhanKhau">
                    <Input disabled />
                </Form.Item>

                <Form.Item label="Nơi đến" name="NoiDen" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>

                <Form.Item label="Từ ngày" name="TuNgay" rules={[{ required: true }]}>
                    <DatePicker style={{ width: "100%" }} />
                </Form.Item>

                <Form.Item label="Đến ngày" name="DenNgay">
                    <DatePicker style={{ width: "100%" }} />
                </Form.Item>

                <Form.Item label="Lý do" name="LyDo">
                    <Input.TextArea rows={3} />
                </Form.Item>

                <Button type="primary" onClick={save}>
                    Lưu thay đổi
                </Button>
            </Form>
        </div>
    );
}
