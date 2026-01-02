import { Form, Input, Button, Card, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

export default function Register() {
    const navigate = useNavigate();

    const onFinish = async (values) => {
        try {
            await axiosClient.post("/auth/register", values);
            message.success("Đăng ký thành công!");
            navigate("/login");
        } catch (err) {
            message.error("Đăng ký thất bại!");
        }
    };

    return (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 80 }}>
            <Card title="Đăng ký tài khoản" style={{ width: 400 }}>

                <Form onFinish={onFinish} layout="vertical">
                    <Form.Item name="username" label="Username" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item name="password" label="Mật khẩu" rules={[{ required: true }]}>
                        <Input.Password />
                    </Form.Item>

                    <Form.Item name="ho" label="Họ" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item name="ten" label="Tên" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
                        <Input />
                    </Form.Item>

                    <Button type="primary" htmlType="submit" block>
                        Đăng ký
                    </Button>

                    <div style={{ marginTop: 10, textAlign: "center" }}>
                        <Link to="/login">Đã có tài khoản? Đăng nhập</Link>
                    </div>
                </Form>

            </Card>
        </div>
    );
}
