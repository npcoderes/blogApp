import { useState, useEffect, use } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Upload,
  Avatar,
  Row,
  Col,
  Divider,
} from "antd";
import {
  UserOutlined,
  UploadOutlined,
  EditOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import { setUser, updateUserProfile } from "../store/authSlice";
import toast from "react-hot-toast";
import api from "../utils/api";
import { initializeAuth } from "../store/authSlice";

const Profile = () => {
  const [form] = Form.useForm();
  const [editing, setEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const { user, userRole, isLoading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user) {
      dispatch(initializeAuth());
    }
  }, [user, dispatch]);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        name: user.username,
        email: user.email,
        bio: user.bio || "",
        phone: user.phone || "",
        location: user.location || "",
      });
    }
  }, [user, form]);

  const handleSubmit = async (values) => {
    try {
      const formData = new FormData();
      Object.keys(values).forEach((key) => {
        if (values[key]) {
          formData.append(key, values[key]);
        }
      });

      let endpoint = "/user/profile";
      let headers = {
        "Content-Type": "application/json",
      };

      // If there's an avatar file, use the complete profile update endpoint
      if (avatarFile) {
        formData.append("avatar", avatarFile);
        endpoint = "/user/profile/complete";
        headers = {
          "Content-Type": "multipart/form-data",
        };
      }

      let response;
      if (avatarFile) {
        response = await api.put(endpoint, formData, { headers });
      } else {
        const profileData = {};
        for (let [key, value] of formData.entries()) {
          profileData[key] = value;
        }
        response = await api.put(endpoint, profileData, { headers });
      }

      if (response.data.success) {
        dispatch(setUser(response.data.user));
        toast.success("Profile updated successfully!");
        setEditing(false);
        setAvatarFile(null);
      } else {
        toast.error(response.data.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.error || "Failed to update profile");
    }
  };

  const handleImageUpload = async (file) => {
    const tid = toast.loading("Uploading image...");
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await api.put("/user/profile/image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        // Update user in Redux store
        dispatch(setUser(response.data.user));
        toast.dismiss(tid);
        toast.success("Profile image updated successfully!");
        setAvatarFile(null);
      } else {
        toast.dismiss(tid);
        toast.error(response.data.error || "Failed to update profile image");
      }
    } catch (error) {
      console.error("Error updating profile image:", error);
      toast.error(
        error.response?.data?.error || "Failed to update profile image"
      );
    } finally {
      toast.dismiss(tid);
    }
  };

  const uploadProps = {
    beforeUpload: (file) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        toast.error("You can only upload image files!");
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        toast.error("Image must be smaller than 2MB!");
        return false;
      }

      // If in editing mode, just store the file for form submission
      if (editing) {
        setAvatarFile(file);
      } else {
        // If not in editing mode, upload image immediately
        handleImageUpload(file);
      }
      return false;
    },
    onRemove: () => {
      setAvatarFile(null);
    },
    fileList: avatarFile ? [avatarFile] : [],
    showUploadList: editing, // Only show upload list when editing
  };

  return (
    <div>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <Card>
            <div style={{ textAlign: "center" }}>
              <Avatar
                size={120}
                src={
                  user?.profile_picture ||
                  (avatarFile && URL.createObjectURL(avatarFile))
                }
                icon={<UserOutlined />}
                style={{ marginBottom: "16px" }}
              />
              <h3>{user?.username}</h3>
              <p style={{ color: "#666", textTransform: "capitalize" }}>
                {userRole}
              </p>
              <p style={{ color: "#999" }}>{user?.email}</p>

              {/* Always visible upload button for profile picture */}
              <div style={{ marginTop: "16px" }}>
                <Upload {...uploadProps}>
                  <Button icon={<UploadOutlined />} size="small">
                    Change Avatar
                  </Button>
                </Upload>
              </div>

              {/* Additional upload area when editing */}
              {editing && avatarFile && (
                <div
                  style={{ marginTop: "12px", fontSize: "12px", color: "#666" }}
                >
                  Selected: {avatarFile.name}
                </div>
              )}
            </div>
          </Card>

          <Card style={{ marginTop: "16px" }} title="Account Stats">
            <div style={{ textAlign: "center" }}>
              <div style={{ margin: "8px 0" }}>
                <strong>Member Since:</strong>
                <p>
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card
            title="Profile Information"
            extra={
              <Button
                type={editing ? "default" : "primary"}
                icon={editing ? <SaveOutlined /> : <EditOutlined />}
                onClick={() => (editing ? form.submit() : setEditing(!editing))}
                loading={isLoading}
              >
                {editing ? "Save Changes" : "Edit Profile"}
              </Button>
            }
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              disabled={!editing}
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="name"
                    label="Full Name"
                    rules={[
                      { required: true, message: "Please enter your name" },
                      { min: 2, message: "Name must be at least 2 characters" },
                    ]}
                  >
                    <Input placeholder="Enter your full name" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="email"
                    label="Email Address"
                    rules={[
                      { required: true, message: "Please enter your email" },
                      { type: "email", message: "Please enter a valid email" },
                    ]}
                  >
                    <Input placeholder="Enter your email" disabled />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item 
                    name="phone" 
                    label="Phone Number"
                    rules={[
                      {
                        pattern: /^\d{10}$/,
                        message: "Phone number must be exactly 10 digits"
                      },
                      {
                        validator: (_, value) => {
                          if (!value) return Promise.resolve();
                          if (!/^\d+$/.test(value)) {
                            return Promise.reject(new Error("Phone number can only contain digits"));
                          }
                          return Promise.resolve();
                        }
                      }
                    ]}
                  >
                    <Input 
                      placeholder="Enter your phone number" 
                      maxLength={10}
                      onKeyPress={(e) => {
                        // Only allow numbers
                        if (!/[0-9]/.test(e.key)) {
                          e.preventDefault();
                        }
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="location" label="Location">
                    <Input placeholder="Enter your location" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="bio" label="Bio">
                <Input.TextArea
                  rows={4}
                  placeholder="Tell us about yourself..."
                  maxLength={500}
                  showCount
                />
              </Form.Item>

              {editing && (
                <Form.Item>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={isLoading}
                      icon={<SaveOutlined />}
                    >
                      Save Changes
                    </Button>
                    <Button
                      onClick={() => {
                        setEditing(false);
                        setAvatarFile(null);
                        if (user) {
                          form.setFieldsValue({
                            name: user.username,
                            email: user.email,
                            bio: user.bio || "",
                            phone: user.phone || "",
                            location: user.location || "",
                          });
                        }
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </Form.Item>
              )}
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Profile;
