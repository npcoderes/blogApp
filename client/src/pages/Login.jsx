import React, { useEffect } from 'react';
import { Form, Input, Button, Typography, Divider } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { loginUser, clearError } from '../store/authSlice';

const { Title, Text } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const onFinish = async (values) => {
    const result = await dispatch(loginUser(values));
    if (loginUser.fulfilled.match(result)) {
      toast.success('Login successful!');
      navigate('/dashboard');
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 70px)',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '40px 35px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px',
        position: 'relative',
        margin: 'auto'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <Title level={1} style={{ 
            marginBottom: '6px', 
            color: '#1a1a1a',
            fontSize: '28px',
            fontWeight: '700'
          }}>
            Welcome back
          </Title>
          <Text style={{ 
            color: '#666',
            fontSize: '15px'
          }}>
            Sign in to your account to continue
          </Text>
        </div>
        
        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="userEmail"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#999' }} />}
              placeholder="Enter your email"
              style={{
                height: '46px',
                borderRadius: '12px',
                border: '2px solid #f0f0f0',
                fontSize: '15px'
              }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#999' }} />}
              placeholder="Enter your password"
              style={{
                height: '46px',
                borderRadius: '12px',
                border: '2px solid #f0f0f0',
                fontSize: '15px'
              }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: '25px' }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              style={{
                width: '100%',
                height: '46px',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: '600',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
              }}
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>

        <Divider style={{ margin: '25px 0', color: '#999' }}>or</Divider>

        <div style={{ textAlign: 'center' }}>
          <Text style={{ color: '#666', fontSize: '14px', display: 'block', marginBottom: '10px' }}>
            Don't have an account?
          </Text>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <Link 
              to="/signup-reader" 
              style={{ 
                color: '#667eea',
                fontWeight: '600',
                textDecoration: 'none',
                fontSize: '14px'
              }}
            >
              Join as Reader
            </Link>
            <Text style={{ color: '#ccc' }}>|</Text>
            <Link 
              to="/signup-author" 
              style={{ 
                color: '#667eea',
                fontWeight: '600',
                textDecoration: 'none',
                fontSize: '14px'
              }}
            >
              Join as Author
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
