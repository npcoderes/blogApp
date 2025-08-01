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
        <Space>
          <Avatar 
            src={record.profile_picture} 
            icon={<UserOutlined />}
            size={40}
          />
          <div>
            <div style={{ fontWeight: 'bold' }}>{record.username}</div>
            <div style={{ color: '#666', fontSize: '12px' }}>{record.user_email}</div>
          </div>
        </Space>
      ),
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
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      render: (location) => location || '-',
    },
    {
      title: 'Joined',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Select
          defaultValue={record.role_name}
          style={{ width: 120 }}
          onChange={(value) => handleRoleChange(record.user_id, value)}
          loading={updatingRole === record.user_id}
        >
          <Option value="reader">Reader</Option>
          <Option value="author">Author</Option>
          <Option value="admin">Admin</Option>
        </Select>
      ),
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
    <div style={{ padding: '24px' }}>
      <Title level={2} style={{ marginBottom: '24px' }}>
        <TeamOutlined /> User Management
      </Title>

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={stats.total}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Admins"
              value={stats.admin}
              prefix={<CrownOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Authors"
              value={stats.author}
              prefix={<EditOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Readers"
              value={stats.reader}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#52c41a' }}
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
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} users`,
          }}
        />
      </Card>
    </div>
  );
};

export default UserManagement;
