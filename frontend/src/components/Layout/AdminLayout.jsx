import { Layout, Menu, Button } from "antd";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const { Header, Sider, Content } = Layout;

export default function AdminLayout() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Sider>
                <Menu theme="dark" mode="inline" style={{ paddingTop: 10 }}>
                    <Menu.Item key="dashboard">
                        <Link to="/dashboard">Dashboard</Link>
                    </Menu.Item>

                    {/* <Menu.Item key="khoanthu">
                        <Link to="/khoanthu">Khoản thu</Link>
                    </Menu.Item> */}

                    <Menu.Item key="hokhau">
                        <Link to="/hokhau">Hộ khẩu</Link>
                    </Menu.Item>

                    <Menu.Item key="nhankhau">
                        <Link to="/nhankhau">Nhân khẩu</Link>
                    </Menu.Item>

                    <Menu.Item key="tamtru">
                        <Link to="/tamtru">Tạm Trú</Link>
                    </Menu.Item>

                    <Menu.Item key="tamvang">
                        <Link to="/tamvang">Tạm Vắng</Link>
                    </Menu.Item>

                    <Menu.Item key="xe">
                        <Link to="/xe">Xe</Link>
                    </Menu.Item>

                    <Menu.Item key="hoadon">
                        <Link to="/hoadon">Hóa đơn</Link>
                    </Menu.Item>
                </Menu>
            </Sider>

            <Layout>
                <Header
                    style={{
                        background: "#fff",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "0 20px"
                    }}
                >
                    <h2 style={{ margin: 0 }}>Quản lý thu phí chung cư</h2>

                    <Button danger type="primary" onClick={handleLogout}>
                        Đăng xuất
                    </Button>
                </Header>

                <Content style={{ margin: 20 }}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
}
