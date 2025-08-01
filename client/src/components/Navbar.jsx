import React, { useState } from "react";
import { Layout, Button, Dropdown, Avatar, Space, Drawer, message } from "antd";
import {
  EditOutlined,
  UserOutlined,
  DashboardOutlined,
  MenuOutlined,
  LogoutOutlined,
  SettingOutlined,
  BookOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/authSlice";

const { Header } = Layout;

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);

  const { isAuthenticated, user, userRole } = useSelector(
    (state) => state.auth
  );

  const handleLogout = () => {
    dispatch(logout());
    message.success('Logged out successfully!');
    navigate("/login");
    setMobileMenuVisible(false);
  };
// Role-based navigation items
  const getNavigationItems = () => {
    const items = [];

    if (isAuthenticated) {
      items.push({
        key: "dashboard",
        label: "Dashboard",
        icon: <DashboardOutlined />,
        onClick: () => {
          navigate("/dashboard");
          setMobileMenuVisible(false);
        },
      });
    }

    return items;
  };

  // User dropdown menu
  const getUserMenuItems = () => {
    const items = [];

    // Logout for all users
    items.push({
      key: "logout",
      label: "Logout",
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    });

    return items;
  };

  return (
    <>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#fff",
          borderBottom: "1px solid #f0f0f0",
          padding: "0 24px",
          height: "70px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
          position: "sticky",
          top: 0,
          zIndex: 1000,
        }}
      >
        {/* Logo */}
        <div
          style={{
            color: "#1a1a1a",
            fontSize: "28px",
            fontWeight: "700",
            cursor: "pointer",
            fontFamily: "serif",
          }}
          onClick={() => navigate("/")}
        >
          Blogs
        </div>

        {/* Desktop Navigation */}
        <div
          className="desktop-nav"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
          }}
        >
          {isAuthenticated ? (
            <>
              {/* Role-based navigation buttons */}
              {getNavigationItems().map((item) => (
                <Button
                  key={item.key}
                  type="text"
                  icon={item.icon}
                  onClick={item.onClick}
                  style={{
                    color: "#666",
                    fontSize: "16px",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  {item.label}
                </Button>
              ))}

              {/* User Avatar Dropdown */}
              <Dropdown
                menu={{ items: getUserMenuItems() }}
                trigger={["click"]}
                placement="bottomRight"
              >
                <Space style={{ cursor: "pointer" }}>
                  <Avatar
                    src={user?.profile_picture}
                    icon={<UserOutlined />}
                    size={36}
                  />
                  <span style={{ color: "#666", fontSize: "14px" }}>
                    {user?.username || "User"}
                  </span>
                </Space>
              </Dropdown>
            </>
          ) : (
            <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
              <Button
                type="text"
                onClick={() => navigate("/login")}
                style={{
                  color: "#666",
                  fontSize: "16px",
                  height: "40px",
                }}
              >
                Sign In
              </Button>
              <Dropdown
                menu={{
                  items: [
                    {
                      key: '1',
                      label: 'Join as Reader',
                      onClick: () => navigate("/signup-reader"),
                    },
                    {
                      key: '2',
                      label: 'Join as Author',
                      onClick: () => navigate("/signup-author"),
                    },
                  ],
                }}
                placement="bottomRight"
              >
                <Button
                  type="primary"
                  style={{
                    background: "#1a1a1a",
                    borderColor: "#1a1a1a",
                    borderRadius: "20px",
                    height: "40px",
                    fontSize: "16px",
                    fontWeight: "500",
                    paddingLeft: "20px",
                    paddingRight: "20px",
                  }}
                >
                  Get Started
                </Button>
              </Dropdown>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          className="mobile-menu-btn"
          type="text"
          icon={<MenuOutlined />}
          onClick={() => setMobileMenuVisible(true)}
          style={{
            display: "none",
            fontSize: "18px",
            height: "40px",
            width: "40px",
          }}
        />
      </Header>

      {/* Mobile Drawer */}
      <Drawer
        title="Menu"
        placement="right"
        onClose={() => setMobileMenuVisible(false)}
        open={mobileMenuVisible}
        width={280}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {isAuthenticated ? (
            <>
              {/* User Info */}
              <div
                style={{
                  padding: "16px",
                  background: "#f5f5f5",
                  borderRadius: "8px",
                  marginBottom: "16px",
                }}
              >
                <Space>
                  <Avatar
                    src={user?.profile_picture}
                    icon={<UserOutlined />}
                    size={40}
                  />
                  <div>
                    <div style={{ fontWeight: "600" }}>
                      {user?.username || "User"}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#666",
                        textTransform: "capitalize",
                      }}
                    >
                      {userRole || "Reader"}
                    </div>
                  </div>
                </Space>
              </div>

              {/* Navigation Items */}
              {getNavigationItems().map((item) => (
                <Button
                  key={item.key}
                  type="text"
                  icon={item.icon}
                  onClick={item.onClick}
                  style={{
                    justifyContent: "flex-start",
                    height: "48px",
                    fontSize: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  {item.label}
                </Button>
              ))}

              <div
                style={{
                  height: "1px",
                  background: "#f0f0f0",
                  margin: "16px 0",
                }}
              />

              {/* Logout Action */}
              <Button
                type="text"
                icon={<LogoutOutlined />}
                onClick={handleLogout}
                style={{
                  justifyContent: "flex-start",
                  height: "48px",
                  fontSize: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  color: "#ff4d4f",
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                size="large"
                onClick={() => {
                  navigate("/login");
                  setMobileMenuVisible(false);
                }}
                style={{ marginBottom: "12px" }}
              >
                Sign In
              </Button>
              <Button
                type="primary"
                size="large"
                onClick={() => {
                  navigate("/signup-reader");
                  setMobileMenuVisible(false);
                }}
                style={{
                  background: "#1a1a1a",
                  borderColor: "#1a1a1a",
                  marginBottom: "8px",
                }}
              >
                Join as Reader
              </Button>
              <Button
                type="primary"
                size="large"
                onClick={() => {
                  navigate("/signup-author");
                  setMobileMenuVisible(false);
                }}
                style={{
                  background: "#1a1a1a",
                  borderColor: "#1a1a1a",
                }}
              >
                Join as Author
              </Button>
            </>
          )}
        </div>
      </Drawer>

      {/* CSS for responsive behavior */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-btn {
            display: flex !important;
          }
        }

        @media (min-width: 769px) {
          .mobile-menu-btn {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
};

export default Navbar;
