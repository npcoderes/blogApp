import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Typography, Tag, Space, Avatar, Button, message } from 'antd';
import { 
  ArrowLeftOutlined, 
  EyeOutlined, 
  MessageOutlined, 
  HeartOutlined,
  HeartFilled 
} from '@ant-design/icons';
import { 
  fetchPostBySlug,
  clearCurrentPost,
  selectCurrentPost,
  selectPostsLoading,
  selectPostsErrors,
  togglePostLike
} from '../store/postsSlice';
import Comments from '../components/Comments';
import '../styles/ViewPost.css';

const { Title, Text } = Typography;

const PublicPostView = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const post = useSelector(selectCurrentPost);
  const loading = useSelector(selectPostsLoading);
  const errors = useSelector(selectPostsErrors);
  const { isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    if (slug) {
      dispatch(fetchPostBySlug(slug));
    }
    
    return () => {
      dispatch(clearCurrentPost());
    };
  }, [slug, dispatch]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      message.warning('Please log in to like this post');
      return;
    }

    try {
      const result = await dispatch(togglePostLike({ postId: post.post_id, likeType: 'like' })).unwrap();
      // Show success message based on like/unlike action
      if (result.liked) {
        message.success('Post liked!');
      } else {
        message.success('Post unliked!');
      }
    } catch (error) {
      message.error('Failed to like post');
    }
  };

  if (loading.currentPost) {
    return (
      <div className="view-post-container">
        <Card loading={true} />
      </div>
    );
  }

  if (errors.currentPost) {
    return (
      <div className="view-post-container">
        <Card>
          <Text>Error: {errors.currentPost}</Text>
        </Card>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="view-post-container">
        <Card>
          <Text>Post not found</Text>
        </Card>
      </div>
    );
  }

  return (
    <div className="view-post-container">
      <div className="view-post-header">
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/')}
        >
          Back to Home
        </Button>
      </div>

      <Card className="view-post-card">
        <div className="view-post-meta">
          <div style={{ flex: 1 }}>
            <Title level={1} className="view-post-title">
              {post.title}
            </Title>
            <Space size="large" className="view-post-stats">
              <Text type="secondary" className="view-post-stats">
                <EyeOutlined /> {post.views || 0} views
              </Text>
              <Text type="secondary" className="view-post-stats">
                <MessageOutlined /> {post.comment_count || 0} comments
              </Text>
              <Button
                type="text"
                icon={post.user_liked ? <HeartFilled /> : <HeartOutlined />}
                onClick={handleLike}
                loading={loading.likeLoading}
                style={{
                  color: post.user_liked ? '#ff4d4f' : '#6b6b6b',
                  padding: 0,
                  height: 'auto'
                }}
              >
                {post.like_count || 0} likes
              </Button>
            </Space>
          </div>
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
          Published: {new Date(post.created_at).toLocaleString()}
          {post.updated_at !== post.created_at && (
            <> • Last Updated: {new Date(post.updated_at).toLocaleString()}</>
          )}
        </div>
      </Card>

      {/* Comments Section */}
      <Comments postId={post.post_id} />
    </div>
  );
};

export default PublicPostView;
