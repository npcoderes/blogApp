import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, Button, Table, Tag, Space, Modal, Dropdown } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, MoreOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  fetchAuthorPosts,
  updatePostStatus,
  deletePost,
  selectAuthorPosts,
  selectPostsLoading,
  selectPostsErrors
} from '../store/postsSlice';

const MyPosts = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [loadingStates, setLoadingStates] = useState({});
  
  const posts = useSelector(selectAuthorPosts);
  const loading = useSelector(selectPostsLoading);
  const errors = useSelector(selectPostsErrors);
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    if (user?.user_id) {
      dispatch(fetchAuthorPosts());
    }
  }, [user?.user_id, dispatch]);

  useEffect(() => {
    if (errors.authorPosts) {
      toast.error(errors.authorPosts);
    }
  }, [errors.authorPosts]);

  const handleStatusChange = async (postId, newStatus) => {
    const loadingKey = `${postId}-${newStatus}`;
    setLoadingStates(prev => ({ ...prev, [loadingKey]: true }));
    
    try {
      await dispatch(updatePostStatus({ postId, status: newStatus })).unwrap();
      toast.success(`Post ${newStatus} successfully`);
      // Refresh the posts list to get updated data
      dispatch(fetchAuthorPosts());
    } catch (error) {
      toast.error(error || 'Failed to update post status');
    } finally {
      setLoadingStates(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  const handleDelete = async () => {
    setLoadingStates(prev => ({ ...prev, [`delete-${postToDelete.post_id}`]: true }));
    
    try {
      await dispatch(deletePost(postToDelete.post_id)).unwrap();
      toast.success('Post deleted successfully');
      setDeleteModalVisible(false);
      setPostToDelete(null);
      // Refresh the posts list after deletion
      dispatch(fetchAuthorPosts());
    } catch (error) {
      toast.error(error || 'Failed to delete post');
    } finally {
      setLoadingStates(prev => ({ ...prev, [`delete-${postToDelete.post_id}`]: false }));
    }
  };

  const handleEdit = (post) => {
    navigate('/dashboard/edit-post', { state: { post } });
  };

  const handleView = (post) => {
    navigate(`/dashboard/view-post/${post.slug}`, { state: { post } });
  };

  const confirmDelete = (post) => {
    setPostToDelete(post);
    setDeleteModalVisible(true);
  };

  const getStatusMenuItems = (post) => [
    {
      key: 'published',
      label: 'Publish',
      disabled: post.status === 'published',
      onClick: () => handleStatusChange(post.post_id, 'published')
    },
    {
      key: 'draft',
      label: 'Move to Draft',
      disabled: post.status === 'draft',
      onClick: () => handleStatusChange(post.post_id, 'draft')
    },
    {
      key: 'archived',
      label: 'Archive',
      disabled: post.status === 'archived',
      onClick: () => handleStatusChange(post.post_id, 'archived')
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'success';
      case 'draft': return 'warning';
      case 'archived': return 'default';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div style={{ maxWidth: '300px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{text}</div>
          {record.excerpt && (
            <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.4' }}>
              {record.excerpt.substring(0, 100)}...
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)} style={{ textTransform: 'capitalize' }}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Views',
      dataIndex: 'views',
      key: 'views',
      render: (views) => views || 0,
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Updated',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
            size="small"
          />
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          />
          {record.status === 'draft' && (
            <Button
              type="primary"
              size="small"
              loading={loadingStates[`${record.post_id}-published`]}
              onClick={() => handleStatusChange(record.post_id, 'published')}
            >
              Publish
            </Button>
          )}
          <Button
            icon={<DeleteOutlined />}
            onClick={() => confirmDelete(record)}
            size="small"
            danger
            loading={loadingStates[`delete-${record.post_id}`]}
          />
          <Dropdown
            menu={{ 
              items: getStatusMenuItems(record).map(item => ({
                ...item,
                onClick: item.onClick,
                disabled: item.disabled || loadingStates[`${record.post_id}-${item.key}`]
              }))
            }}
            trigger={['click']}
          >
            <Button icon={<MoreOutlined />} size="small" />
          </Dropdown>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '24px' 
        }}>
          <h2>My Posts</h2>
          <Button 
            type="primary" 
            onClick={() => navigate('/dashboard/create-post')}
          >
            Create New Post
          </Button>
        </div>
        
        <Table
          columns={columns}
          dataSource={posts}
          rowKey="post_id"
          loading={loading.authorPosts}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} posts`,
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      <Modal
        title="Delete Post"
        open={deleteModalVisible}
        onOk={handleDelete}
        onCancel={() => setDeleteModalVisible(false)}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ 
          danger: true,
          loading: postToDelete ? loadingStates[`delete-${postToDelete.post_id}`] : false
        }}
      >
        <p>Are you sure you want to delete this post? This action cannot be undone.</p>
        {postToDelete && (
          <p><strong>{postToDelete.title}</strong></p>
        )}
      </Modal>
    </div>
  );
};

export default MyPosts;
