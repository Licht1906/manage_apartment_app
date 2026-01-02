import { useState } from "react";
import { Form, Input, Button, Card, message } from "antd";
import axiosClient from "../api/axiosClient";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth(); 

    const onFinish = async (values) => {
        try {
            setLoading(true);

            const res = await axiosClient.post("/auth/login", values);

            login(res.data.token);

            message.success("Đăng nhập thành công!");

            navigate("/dashboard");

        } catch (err) {
            message.error("Sai username hoặc mật khẩu");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div 
            style={{ 
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                backgroundColor: "#f0f2f5"
            }}
        >
            <Card title="Đăng nhập hệ thống" style={{ width: 350 }}>
                <Form onFinish={onFinish}>
                    <Form.Item name="username" rules={[{ required: true }]}>
                        <Input placeholder="Username" />
                    </Form.Item>

                    <Form.Item name="password" rules={[{ required: true }]}>
                        <Input.Password placeholder="Password" />
                    </Form.Item>

                    <Button type="primary" htmlType="submit" loading={loading} block>
                        Đăng nhập
                    </Button>

                    <div style={{ marginTop: 15, textAlign: "center" }}>
                        <Link to="/register">Chưa có tài khoản? Đăng ký</Link>
                    </div>
                </Form>
            </Card>
        </div>
    );
}
