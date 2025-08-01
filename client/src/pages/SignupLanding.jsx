import React from 'react';
import { Button, Typography, Card } from 'antd';
import { UserOutlined, EditOutlined, BookOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const SignupLanding = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '20px',
        padding: '50px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '600px',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '40px' }}>
          <Title level={1} style={{ 
            color: '#2c3e50', 
            marginBottom: '15px',
            fontWeight: '700',
            fontSize: '48px'
          }}>
            Join Our Community
          </Title>
          <Text style={{ 
            color: '#7f8c8d', 
            fontSize: '18px',
            display: 'block'
          }}>
            Choose how you'd like to get started
          </Text>
        </div>

        <div style={{ 
          display: 'flex', 
          gap: '30px', 
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <Card
            hoverable
            style={{
              width: 250,
              borderRadius: '15px',
              border: '2px solid #f0f0f0',
              transition: 'all 0.3s ease'
            }}
            bodyStyle={{ padding: '30px' }}
            onClick={() => navigate('/signup-reader')}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '48px', 
                color: '#52c41a',
                marginBottom: '20px'
              }}>
                <BookOutlined />
              </div>
              <Title level={3} style={{ 
                color: '#2c3e50',
                marginBottom: '15px'
              }}>
                Reader
              </Title>
              <Text style={{ 
                color: '#7f8c8d',
                fontSize: '16px',
                display: 'block',
                marginBottom: '20px'
              }}>
                Discover and read amazing stories from talented authors
              </Text>
              <Button
                type="primary"
                size="large"
                style={{
                  background: '#52c41a',
                  borderColor: '#52c41a',
                  borderRadius: '8px',
                  height: '45px',
                  width: '100%',
                  fontWeight: '600'
                }}
              >
                Join as Reader
              </Button>
            </div>
          </Card>

          <Card
            hoverable
            style={{
              width: 250,
              borderRadius: '15px',
              border: '2px solid #f0f0f0',
              transition: 'all 0.3s ease'
            }}
            bodyStyle={{ padding: '30px' }}
            onClick={() => navigate('/signup-author')}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '48px', 
                color: '#f5576c',
                marginBottom: '20px'
              }}>
                <EditOutlined />
              </div>
              <Title level={3} style={{ 
                color: '#2c3e50',
                marginBottom: '15px'
              }}>
                Author
              </Title>
              <Text style={{ 
                color: '#7f8c8d',
                fontSize: '16px',
                display: 'block',
                marginBottom: '20px'
              }}>
                Share your creativity and publish your stories for the world
              </Text>
              <Button
                type="primary"
                size="large"
                style={{
                  background: '#f5576c',
                  borderColor: '#f5576c',
                  borderRadius: '8px',
                  height: '45px',
                  width: '100%',
                  fontWeight: '600'
                }}
              >
                Join as Author
              </Button>
            </div>
          </Card>
        </div>

        <div style={{ marginTop: '40px' }}>
          <Text style={{ color: '#666', fontSize: '16px' }}>
            Already have an account? {' '}
            <Link 
              to="/login" 
              style={{ 
                color: '#667eea', 
                fontWeight: '600',
                textDecoration: 'none'
              }}
            >
              Sign In
            </Link>
          </Text>
        </div>
      </div>
    </div>
  );
};

export default SignupLanding;
