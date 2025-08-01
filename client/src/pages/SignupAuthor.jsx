import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Typography, Upload, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, UploadOutlined, EditOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { registerUser, clearError } from '../store/authSlice';

const { Title, Text } = Typography;

const SignupAuthor = () => {
  const [fileList, setFileList] = useState([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const onFinish = async (values) => {
    const formData = new FormData();
    formData.append('username', values.username);
    formData.append('password', values.password);
    formData.append('userEmail', values.userEmail);
    formData.append('roleName', 'author'); // Hardcoded to author
    
    if (fileList.length > 0) {
      formData.append('profilePicture', fileList[0].originFileObj);
    }

    const result = await dispatch(registerUser(formData));
    if (registerUser.fulfilled.match(result)) {
      toast.success('Registration successful! You can now create and publish amazing stories.');
      navigate('/login');
    }
  };

  const uploadProps = {
    fileList,
    onChange: ({ fileList: newFileList }) => {
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        toast.error('You can only upload image files!');
        return false;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        toast.error('Image must be smaller than 5MB!');
        return false;
      }
      return false;
    },
    onRemove: () => {
      setFileList([]);
    },
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '450px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ 
            fontSize: '48px', 
            marginBottom: '15px',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            <EditOutlined />
          </div>
          <Title level={2} style={{ 
            color: '#2c3e50', 
            marginBottom: '10px',
            fontWeight: '700' 
          }}>
            Join as Author
          </Title>
          <Text style={{ 
            color: '#7f8c8d', 
            fontSize: '16px' 
          }}>
            Share your stories with the world
          </Text>
        </div>

        <Form
          name="signup_author"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#999' }} />}
              placeholder="Author Name"
              style={{
                height: '44px',
                borderRadius: '8px',
                border: '2px solid #f0f0f0',
                fontSize: '14px'
              }}
            />
          </Form.Item>

          <Form.Item
            name="userEmail"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: '#999' }} />}
              placeholder="Email Address"
              style={{
                height: '44px',
                borderRadius: '8px',
                border: '2px solid #f0f0f0',
                fontSize: '14px'
              }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 6, message: 'Password must be at least 6 characters!' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#999' }} />}
              placeholder="Password"
              style={{
                height: '44px',
                borderRadius: '8px',
                border: '2px solid #f0f0f0',
                fontSize: '14px'
              }}
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#999' }} />}
              placeholder="Confirm Password"
              style={{
                height: '44px',
                borderRadius: '8px',
                border: '2px solid #f0f0f0',
                fontSize: '14px'
              }}
            />
          </Form.Item>

          <Form.Item label="Profile Picture (Optional)">
            <Upload {...uploadProps}>
              <Button 
                icon={<UploadOutlined />}
                style={{
                  height: '44px',
                  borderRadius: '8px',
                  border: '2px solid #f0f0f0',
                  width: '100%'
                }}
              >
                Upload Profile Picture
              </Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              style={{
                width: '100%',
                height: '48px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                border: 'none',
                boxShadow: '0 4px 15px rgba(245, 87, 108, 0.4)'
              }}
            >
              Create Author Account
            </Button>
          </Form.Item>

          <Divider style={{ margin: '20px 0' }}>
            <Text style={{ color: '#999' }}>OR</Text>
          </Divider>

          <div style={{ textAlign: 'center' }}>
            <Text style={{ color: '#666' }}>
              Just want to read? {' '}
              <Link 
                to="/signup-reader" 
                style={{ 
                  color: '#f5576c', 
                  fontWeight: '600',
                  textDecoration: 'none'
                }}
              >
                Join as Reader
              </Link>
            </Text>
          </div>

          <div style={{ textAlign: 'center', marginTop: '15px' }}>
            <Text style={{ color: '#666' }}>
              Already have an account? {' '}
              <Link 
                to="/login" 
                style={{ 
                  color: '#f5576c', 
                  fontWeight: '600',
                  textDecoration: 'none'
                }}
              >
                Sign In
              </Link>
            </Text>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default SignupAuthor;
