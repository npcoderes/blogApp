import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Card, Button, Typography, Tag, Space, Divider, Avatar, Modal, Dropdown } from 'antd';
import { EditOutlined, DeleteOutlined, ArrowLeftOutlined, MoreOutlined, EyeOutlined } from '@ant-design/icons';
import toast from 'react-hot-toast';
import api from '../utils/api';
import '../styles/ViewPost.css';

const { Title, Text, Paragraph } = Typography;

const ViewPost = () => {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const [post, setPost] = useState(location.state?.post || null);
  const [loading, setLoading] = useState(!post);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  useEffect(() => {
    if (!post && slug) {
      fetchPost();
    }
  }, [slug, post]);

  const fetchPost = async () => {
    setLoading(true);
    try {
      // First try to get from public endpoint
      const response = await api.get(`/posts/${slug}`);
      if (response.data.success) {
        console.log('Post fetched successfully:', response.data.data);
        setPost(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      toast.error('Failed to fetch post');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await api.patch(`/posts/${post.post_id}/status`, {
        status: newStatus
      });
      
      if (response.data.success) {
        toast.success(response.data.message);
        setPost({ ...post, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update post status');
    }
  };

  const handleDelete = async () => {
    try {
      const response = await api.delete(`/posts/${post.post_id}`);
      if (response.data.success) {
        toast.success('Post deleted successfully');
        navigate('/dashboard/my-posts');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const handleEdit = () => {
    navigate('/dashboard/edit-post', { state: { post } });
  };

  const getStatusMenuItems = () => [
    {
      key: 'published',
      label: 'Publish',
      disabled: post.status === 'published',
      onClick: () => handleStatusChange('published')
    },
    {
      key: 'draft',
      label: 'Move to Draft',
      disabled: post.status === 'draft',
      onClick: () => handleStatusChange('draft')
    },
    {
      key: 'archived',
      label: 'Archive',
      disabled: post.status === 'archived',
      onClick: () => handleStatusChange('archived')
    }
  ];

  const isAuthor = user?.user_id === post?.author_id;
  const canEdit = isAuthor || user?.role_name === 'admin';

  if (loading) {
    return (
      <div style={{ padding: '24px' }}>
        <Card loading={loading} />
      </div>
    );
  }

  if (!post) {
    return (
      <div style={{ padding: '24px' }}>
        <Card>
          <Text>Post not found</Text>
        </Card>
      </div>
    );
  }

  const statusColors = {
    published: 'green',
    draft: 'orange',
    archived: 'red'
  };

  return (
    <div className="view-post-container">
      <div className="view-post-header">
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/dashboard/my-posts')}
        >
          Back to My Posts
        </Button>
      </div>

      <Card className="view-post-card">
        <div className="view-post-meta">
          <div style={{ flex: 1 }}>
            <Title level={1} className="view-post-title">
              {post.title}
            </Title>
            <Space size="large" className="view-post-stats">
              <Tag color={statusColors[post.status]} className="view-post-status-tag">
                {post.status.toUpperCase()}
              </Tag>
              <Text type="secondary" className="view-post-stats">
                {post.views} views • {post.comment_count} comments • {post.like_count} likes
              </Text>
            </Space>
          </div>
          
          {canEdit && (
            <div className="view-post-actions">
              <Button 
                type="primary" 
                icon={<EditOutlined />} 
                onClick={handleEdit}
              >
                Edit
              </Button>
              <Dropdown 
                menu={{ items: getStatusMenuItems() }}
                trigger={['click']}
              >
                <Button icon={<MoreOutlined />}>Status</Button>
              </Dropdown>
              <Button 
                danger 
                icon={<DeleteOutlined />} 
                onClick={() => setDeleteModalVisible(true)}
              >
                Delete
              </Button>
            </div>
          )}
        </div>

        {post.featured_image && (
          <img 
            src={post.featured_image} 
            alt={post.title}
            className="view-post-featured-image"
          />
        )}

        <div className="view-post-author">
          <Avatar src={post.profile_picture} size="large">
            {post.username?.[0]?.toUpperCase()}
          </Avatar>
          <div>
            <div className="view-post-author-name">{post.username}</div>
            <div className="view-post-date">
              Published on {new Date(post.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        </div>

        {post.excerpt && (
          <div className="view-post-excerpt">
            {post.excerpt}
          </div>
        )}

        <div 
          className="view-post-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {post.tags && post.tags.length > 0 && (
          <div className="view-post-tags">
            <div className="view-post-tags-title">Tags</div>
            <Space wrap>
              {post.tags.map((tag, index) => (
                <Tag key={index} className="view-post-tag">{tag}</Tag>
              ))}
            </Space>
          </div>
        )}

        <div className="view-post-footer">
          Created: {new Date(post.created_at).toLocaleString()} • 
          Last Updated: {new Date(post.updated_at).toLocaleString()}
        </div>
      </Card>

      <Modal
        title="Delete Post"
        open={deleteModalVisible}
        onOk={handleDelete}
        onCancel={() => setDeleteModalVisible(false)}
        okText="Delete"
        okButtonProps={{ danger: true }}
      >
        <p>Are you sure you want to delete "{post.title}"?</p>
        <p>This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default ViewPost;
