import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Avatar, 
  Space, 
  Card, 
  Typography, 
  Image,
  Row,
  Col,
  Statistic,
  Input,
  Spin
} from 'antd';
import { 
  BookOutlined, 
  UserOutlined, 
  EyeOutlined,
  SearchOutlined,
  FileTextOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';

const { Title } = Typography;
const { Search } = Input;

const PostManagement = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    // Filter posts based on search text
    if (searchText) {
      const filtered = posts.filter(post =>
        post.title?.toLowerCase().includes(searchText.toLowerCase()) ||
        post.author_name?.toLowerCase().includes(searchText.toLowerCase()) ||
        post.content?.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredPosts(filtered);
    } else {
      setFilteredPosts(posts);
    }
  }, [searchText, posts]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/user/admin/posts', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Posts response:', response.data);
      
      if (response.data.success) {
        setPosts(response.data.data);
        setFilteredPosts(response.data.data);
      } else {
        toast.error('Failed to fetch posts');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const getAuthorStats = () => {
    const authorStats = posts.reduce((acc, post) => {
      const authorId = post.author_id || post.user_id;
      if (!acc[authorId]) {
        acc[authorId] = {
          author_name: post.author_name,
          author_email: post.author_email,
          author_avatar: post.author_avatar,
          post_count: 0,
        };
      }
      acc[authorId].post_count++;
      return acc;
    }, {});

    return Object.values(authorStats).sort((a, b) => b.post_count - a.post_count);
  };

  const authorStats = getAuthorStats();

  const columns = [
    {
      title: 'Post',
      key: 'post',
      render: (_, record) => (
        <Space>
          {record.featured_image ? (
            <Image
              src={record.featured_image}
              alt={record.title}
              width={60}
              height={40}
              style={{ objectFit: 'cover', borderRadius: '4px' }}
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
            />
          ) : (
            <div style={{
              width: 60,
              height: 40,
              backgroundColor: '#f5f5f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px'
            }}>
              <FileTextOutlined style={{ color: '#ccc' }} />
            </div>
          )}
          <div style={{ maxWidth: '300px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
              {record.title && record.title.length > 40 ? `${record.title.substring(0, 40)}...` : record.title}
            </div>
            <div style={{ color: '#666', fontSize: '12px' }}>
              {record.content && record.content.replace(/<[^>]*>/g, '').length > 60 
                ? `${record.content.replace(/<[^>]*>/g, '').substring(0, 60)}...`
                : record.content?.replace(/<[^>]*>/g, '') || ''
              }
            </div>
          </div>
        </Space>
      ),
      width: '40%',
    },
    {
      title: 'Author',
      key: 'author',
      render: (_, record) => (
        <Space>
          <Avatar 
            src={record.author_avatar} 
            icon={<UserOutlined />}
            size={32}
          />
          <div>
            <div style={{ fontWeight: '500' }}>{record.author_name}</div>
            <div style={{ color: '#666', fontSize: '12px' }}>{record.author_email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => (
        <div>
          <div>{new Date(date).toLocaleDateString()}</div>
          <div style={{ color: '#666', fontSize: '12px' }}>
            {new Date(date).toLocaleTimeString()}
          </div>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button 
          type="primary" 
          size="small"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/post/${record.slug}`)}
        >
          View
        </Button>
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
        <BookOutlined /> Post Management
      </Title>

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Posts"
              value={posts.length}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Active Authors"
              value={authorStats.length}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Posts This Month"
              value={posts.filter(post => {
                const postDate = new Date(post.created_at);
                const now = new Date();
                return postDate.getMonth() === now.getMonth() && postDate.getFullYear() === now.getFullYear();
              }).length}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Search */}
      <Card style={{ marginBottom: '16px' }}>
        <Search
          placeholder="Search posts by title, author, or content..."
          allowClear
          size="large"
          prefix={<SearchOutlined />}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ maxWidth: 500 }}
        />
      </Card>

      {/* Posts Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredPosts}
          rowKey="post_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} posts`,
          }}
        />
      </Card>
    </div>
  );
};

export default PostManagement;
