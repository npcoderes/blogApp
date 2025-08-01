import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Select, 
  Avatar, 
  Space, 
  Card, 
  Typography, 
  Tag, 
  Popconfirm,
  Row,
  Col,
  Statistic,
  Spin
} from 'antd';
import { 
  UserOutlined, 
  TeamOutlined,
  CrownOutlined,
  EditOutlined,
  BookOutlined
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import api from '../utils/api';

const { Title } = Typography;
const { Option } = Select;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingRole, setUpdatingRole] = useState(null);
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/user/admin/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Users response:', response.data);
      
      if (response.data.success) {
        setUsers(response.data.data);
      } else {
        toast.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      setUpdatingRole(userId);
      const response = await api.put(
        `/user/admin/users/${userId}/role`,
        { role: newRole },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success('User role updated successfully');
        fetchUsers(); // Refresh the users list
      } else {
        toast.error('Failed to update user role');
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    } finally {
      setUpdatingRole(null);
    }
  };

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'red';
      case 'author':
        return 'blue';
      case 'reader':
        return 'green';
      default:
        return 'default';
    }
  };

  const getRoleIcon = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return <CrownOutlined />;
      case 'author':
        return <EditOutlined />;
      case 'reader':
        return <BookOutlined />;
      default:
        return <UserOutlined />;
    }
  };

  const getUserStats = () => {
    const stats = users.reduce((acc, user) => {
      const role = user.role_name?.toLowerCase() || 'unknown';
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {});
    
    return {
      total: users.length,
      admin: stats.admin || 0,
      author: stats.author || 0,
      reader: stats.reader || 0,
    };
  };

  const stats = getUserStats();

  const columns = [
    {
      title: 'User',
      key: 'user',
      render: (_, record) => (
        <Space direction="vertical" size="small" style={{ display: 'flex' }}>
          <Space>
            <Avatar 
              src={record.profile_picture} 
              icon={<UserOutlined />}
              size={40}
            />
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{record.username}</div>
              <div style={{ color: '#666', fontSize: '12px', wordBreak: 'break-all' }}>
                {record.user_email}
              </div>
            </div>
          </Space>
        </Space>
      ),
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    {
      title: 'Role',
      dataIndex: 'role_name',
      key: 'role',
      render: (role) => (
        <Tag color={getRoleColor(role)} icon={getRoleIcon(role)}>
          {role?.toUpperCase() || 'UNKNOWN'}
        </Tag>
      ),
      responsive: ['sm', 'md', 'lg', 'xl'],
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      render: (location) => location || '-',
      responsive: ['md', 'lg', 'xl'],
    },
    {
      title: 'Joined',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleDateString(),
      responsive: ['lg', 'xl'],
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Select
          defaultValue={record.role_name}
          style={{ width: '100%', minWidth: '100px' }}
          onChange={(value) => handleRoleChange(record.user_id, value)}
          loading={updatingRole === record.user_id}
        >
          <Option value="reader">Reader</Option>
          <Option value="author">Author</Option>
          <Option value="admin">Admin</Option>
        </Select>
      ),
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '12px 16px' }}>
      <Title level={2} style={{ marginBottom: '16px', fontSize: '20px' }}>
        <TeamOutlined /> User Management
      </Title>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
        <Col xs={12} sm={12} md={6} lg={6} xl={6}>
          <Card size="small">
            <Statistic
              title="Total Users"
              value={stats.total}
              prefix={<UserOutlined />}
              valueStyle={{ fontSize: '18px' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6} xl={6}>
          <Card size="small">
            <Statistic
              title="Admins"
              value={stats.admin}
              prefix={<CrownOutlined />}
              valueStyle={{ color: '#cf1322', fontSize: '18px' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6} xl={6}>
          <Card size="small">
            <Statistic
              title="Authors"
              value={stats.author}
              prefix={<EditOutlined />}
              valueStyle={{ color: '#1890ff', fontSize: '18px' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6} lg={6} xl={6}>
          <Card size="small">
            <Statistic
              title="Readers"
              value={stats.reader}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#52c41a', fontSize: '18px' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Users Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={users}
          rowKey="user_id"
          loading={loading}
          scroll={{ x: 800 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} users`,
            responsive: true,
            size: 'small',
          }}
        />
      </Card>
    </div>
  );
};

export default UserManagement;
