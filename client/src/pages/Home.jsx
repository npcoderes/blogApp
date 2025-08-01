import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Typography, Tag, Space, Avatar, Input, Spin, Empty, Button, message } from 'antd';
import { 
  SearchOutlined, 
  EyeOutlined, 
  MessageOutlined, 
  HeartOutlined,
  HeartFilled ,
   UserOutlined,
} from '@ant-design/icons';
import { 
  fetchPublicPosts, 
  fetchPostTags,
  setSelectedTag,
  setSearchQuery,
  setSelectedAuthor,
  selectFilteredPosts,
  selectTags,
  selectSelectedTag,
  selectSearchQuery,
  selectSelectedAuthor,
  selectUniqueAuthors,
  selectPostsLoading,
  selectPostsErrors,
  togglePostLike
} from '../store/postsSlice';
import '../styles/Home.css';

const { Title, Text } = Typography;
const { Search } = Input;

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [authorSearchQuery, setAuthorSearchQuery] = useState('');
  
  // Redux selectors
  const filteredPosts = useSelector(selectFilteredPosts);
  const tags = useSelector(selectTags);
  const selectedTag = useSelector(selectSelectedTag);
  const searchQuery = useSelector(selectSearchQuery);
  const selectedAuthor = useSelector(selectSelectedAuthor);
  const uniqueAuthors = useSelector(selectUniqueAuthors);
  const loading = useSelector(selectPostsLoading);
  const errors = useSelector(selectPostsErrors);
  const { isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    dispatch(fetchPublicPosts());
    dispatch(fetchPostTags());
  }, [dispatch]);

  const handlePostClick = (post, event) => {
    // Prevent navigation if clicking on interactive elements
    if (event.target.closest('.post-stats, .like-button')) {
      return;
    }
    navigate(`/post/${post.slug}`);
  };

  const handleTagClick = (tag) => {
    dispatch(setSelectedTag(selectedTag === tag ? '' : tag));
  };

  const handleSearchChange = (e) => {
    dispatch(setSearchQuery(e.target.value));
  };

  const handleAuthorClick = (authorName) => {
    dispatch(setSelectedAuthor(selectedAuthor === authorName ? '' : authorName));
  };

  const handleLike = async (event, postId) => {
    event.stopPropagation(); // Prevent card click
    
    if (!isAuthenticated) {
      message.warning('Please log in to like posts');
      return;
    }

    try {
      const result = await dispatch(togglePostLike({ postId, likeType: 'like' })).unwrap();
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

  return (
    <div className="home-container">
      <div className="home-header">
        <Title level={1} className="home-title">Discover Stories</Title>
        <Text className="home-subtitle">Find the best stories from writers around the world</Text>
        
        <div className="home-search">
          <Search
            placeholder="Search articles..."
            allowClear
            size="large"
            value={searchQuery}
            onChange={handleSearchChange}
            onSearch={(value) => dispatch(setSearchQuery(value))}
            prefix={<SearchOutlined />}
          />
          
          {(selectedTag || searchQuery || selectedAuthor) && (
            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <Text type="secondary" style={{ fontSize: '14px' }}>Active filters:</Text>
              {selectedTag && (
                <Tag 
                  closable 
                  onClose={() => dispatch(setSelectedTag(''))}
                  color="blue"
                >
                  Tag: {selectedTag}
                </Tag>
              )}
              {searchQuery && (
                <Tag 
                  closable 
                  onClose={() => dispatch(setSearchQuery(''))}
                  color="green"
                >
                  Search: "{searchQuery}"
                </Tag>
              )}
              {selectedAuthor && (
                <Tag 
                  closable 
                  onClose={() => dispatch(setSelectedAuthor(''))}
                  color="purple"
                >
                  Author: {selectedAuthor}
                </Tag>
              )}
              <Button 
                type="link" 
                size="small" 
                onClick={() => {
                  dispatch(setSelectedTag(''));
                  dispatch(setSearchQuery(''));
                  dispatch(setSelectedAuthor(''));
                }}
                style={{ padding: '0 4px', fontSize: '12px' }}
              >
                Clear All
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="home-content">
        <div className="home-main">
          {loading.publicPosts ? (
            <div className="loading-container">
              <Spin size="large" />
            </div>
          ) : errors.publicPosts ? (
            <Empty description={`Error: ${errors.publicPosts}`} />
          ) : filteredPosts.length === 0 ? (
            <Empty 
              description={
                selectedTag || searchQuery || selectedAuthor
                  ? "No posts found matching your filters" 
                  : "No posts found"
              }
            />
          ) : (
            <>
              <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text type="secondary">
                  Showing {filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''}
                  {(selectedTag || searchQuery || selectedAuthor) && ' (filtered)'}
                </Text>
              </div>
              <div className="posts-grid">
                {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className="post-card"
                  onClick={(e) => handlePostClick(post, e)}
                >
                  <div className="post-content">
                    <Title level={4} className="post-title">
                      {post.title}
                    </Title>
                    
                    {post.excerpt && (
                      <Text className="post-excerpt">
                        {post.excerpt}
                      </Text>
                    )}

                    <div className="post-author">
                      <Avatar src={post.profile_picture} size="small">
                        {post.username?.[0]?.toUpperCase()}
                      </Avatar>
                      <div className="author-info">
                        <Text className="author-name">{post.username}</Text>
                        <Text className="post-date">
                          {new Date(post.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </Text>
                      </div>
                    </div>

                    <div className="post-stats">
                      <Space size="large">
                        <Text type="secondary" className="stat-item">
                          <EyeOutlined /> {post.views || 0}
                        </Text>
                        <Text type="secondary" className="stat-item">
                          <MessageOutlined /> {post.comment_count || 0}
                        </Text>
                        <Button
                          type="text"
                          size="small"
                          className="like-button stat-item"
                          icon={post.user_liked ? <HeartFilled /> : <HeartOutlined />}
                          onClick={(e) => handleLike(e, post.post_id)}
                          style={{
                            color: post.user_liked ? '#ff4d4f' : '#6b6b6b',
                            padding: 0,
                            height: 'auto',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          {post.like_count || 0}
                        </Button>
                      </Space>
                    </div>

                    {post.tags && post.tags.length > 0 && (
                      <div className="post-tags">
                        {post.tags.slice(0, 3).map((tag, index) => (
                          <Tag key={index} size="small" className="post-tag">{tag}</Tag>
                        ))}
                      </div>
                    )}
                  </div>

                  {post.featured_image && (
                    <div className="post-image-container">
                      <img
                        alt={post.title}
                        src={post.featured_image}
                        className="post-image"
                      />
                    </div>
                  )}
                </div>
              ))}
              </div>
            </>
          )}
        </div>

        <div className="home-sidebar">
          <div className="tags-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <Title level={4} style={{ margin: 0 }}>Popular Tags</Title>
              {selectedTag && (
                <Button 
                  type="link" 
                  size="small" 
                  onClick={() => dispatch(setSelectedTag(''))}
                  style={{ padding: '0', fontSize: '12px' }}
                >
                  Show All
                </Button>
              )}
            </div>
            {loading.tags ? (
              <Spin size="small" />
            ) : (
              <div className="tags-container">
                {tags.map((tag) => (
                  <Tag
                    key={tag.name}
                    className={`tag-item ${selectedTag === tag.name ? 'tag-selected' : ''}`}
                    onClick={() => handleTagClick(tag.name)}
                  >
                    {tag.name} ({tag.count})
                  </Tag>
                ))}
              </div>
            )}
          </div>

          <div className="authors-section" style={{ marginTop: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <Title level={4} style={{ margin: 0 }}>Popular Authors</Title>
              {selectedAuthor && (
                <Button 
                  type="link" 
                  size="small" 
                  onClick={() => dispatch(setSelectedAuthor(''))}
                  style={{ padding: '0', fontSize: '12px' }}
                >
                  Show All
                </Button>
              )}
            </div>
            <Input
              placeholder="Search authors..."
              value={authorSearchQuery}
              onChange={(e) => setAuthorSearchQuery(e.target.value)}
              style={{ marginBottom: '12px' }}
              size="small"
              prefix={<SearchOutlined />}
              allowClear
            />
            <div className="authors-container">
              {uniqueAuthors
                .filter(author => 
                  authorSearchQuery === '' || 
                  author.name.toLowerCase().includes(authorSearchQuery.toLowerCase())
                )
                .slice(0, 10)
                .map((author) => (
                <div
                  key={author.name}
                  className={`author-item ${selectedAuthor === author.name ? 'author-selected' : ''}`}
                  onClick={() => handleAuthorClick(author.name)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: selectedAuthor === author.name ? '1px solid #1890ff' : '1px solid transparent',
                    backgroundColor: selectedAuthor === author.name ? '#e6f7ff' : 'transparent',
                    marginBottom: '4px'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedAuthor !== author.name) {
                      e.target.style.backgroundColor = '#f5f5f5';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedAuthor !== author.name) {
                      e.target.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <Avatar 
                    src={author.profile_picture} 
                    size={24}
                    icon={<UserOutlined />}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text 
                      style={{ 
                        fontSize: '14px', 
                        fontWeight: selectedAuthor === author.name ? '500' : '400',
                        color: selectedAuthor === author.name ? '#1890ff' : '#333'
                      }}
                      ellipsis
                    >
                      {author.name}
                    </Text>
                  </div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {author.count}
                  </Text>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
