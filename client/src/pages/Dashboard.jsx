import { useState, useEffect } from "react";
import { Layout, Menu, theme, Button } from "antd";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  UserOutlined,
  EditOutlined,
  DashboardOutlined,
  FileTextOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { getDashLinksForRole } from "../utils/dashLinks";
import '../styles/Dashboard.css'

const { Header, Sider, Content } = Layout;

const Dashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { userRole, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Handle screen size changes
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        setCollapsed(true);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const iconMap = {
    UserOutlined: <UserOutlined />,
    EditOutlined: <EditOutlined />,
    DashboardOutlined: <DashboardOutlined />,
    FileTextOutlined: <FileTextOutlined />,
  };

  const rawMenuItems = getDashLinksForRole(userRole);
  const menuItems = rawMenuItems.map((item) => ({
    ...item,
    icon: iconMap[item.icon] || <UserOutlined />,
  }));

  const handleMenuClick = ({ key }) => {
    const item = menuItems.find((item) => item.key === key);
    if (item) {
      navigate(item.path);
    }
  };

  const getSelectedKey = () => {
    const currentPath = location.pathname;
    const item = menuItems.find((item) => item.path === currentPath);
    return item ? [item.key] : [];
  };

  return (
    <Layout className="dashboard-container">
      {/* Mobile backdrop */}
      {!collapsed && isMobile && (
        <div 
          className="dashboard-backdrop"
          onClick={() => setCollapsed(true)}
        />
      )}
      
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        breakpoint="lg"
        collapsedWidth="0"
        onBreakpoint={(broken) => {
          setCollapsed(broken);
        }}
        className="dashboard-sider"
      >
        <div className="dashboard-logo">
          {collapsed ? "B" : "Blog Dashboard"}
        </div>
        <Menu
          className="dashboard-menu"
          mode="inline"
          selectedKeys={getSelectedKey()}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <Layout>
        <Header className="dashboard-header">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="dashboard-trigger"
          />
          <div>
            <span>Welcome, {user?.username || 'User'}</span>
            <span
              style={{
                marginLeft: "16px",
                padding: "4px 8px",
                background: "#f0f0f0",
                borderRadius: "4px",
                fontSize: "12px",
                textTransform: "capitalize",
              }}
            >
              {userRole}
            </span>
          </div>
        </Header>
        <Content className="dashboard-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;
