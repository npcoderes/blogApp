import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  Avatar,
  Button,
  Input,
  message,
  Space,
  Typography,
  Divider,
  Spin,
  Empty,
} from "antd";
import {
  LikeOutlined,
  DislikeOutlined,
  MessageOutlined,
  EditOutlined,
  DeleteOutlined,
  LikeFilled,
  DislikeFilled,
} from "@ant-design/icons";
import {
  fetchPostComments,
  createComment,
  updateComment,
  deleteComment,
  toggleCommentLike,
  selectComments,
  selectCommentsLoading,
  selectCommentsErrors,
} from "../store/commentsSlice";

const { TextArea } = Input;
const { Text } = Typography;

const CommentForm = ({
  postId,
  parentId = null,
  onSuccess,
  placeholder = "Write a comment...",
  buttonText = "Comment",
  onCommentAdded,
}) => {
  const dispatch = useDispatch();
  const [content, setContent] = useState("");
  const { create: loading } = useSelector(selectCommentsLoading);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      message.warning("Please log in to comment");
      return;
    }

    if (!content.trim()) {
      message.error("Please enter a comment");
      return;
    }

    console.log("Submitting comment with postId:", postId); // Debug log

    try {
      await dispatch(
        createComment({
          content: content.trim(),
          postId,
          parentCommentId: parentId,
        })
      ).unwrap();

      if (onCommentAdded) {
        onCommentAdded();
      }

      setContent("");
      message.success("Comment added successfully");
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Comment submission error:", error);
      message.error(error || "Failed to add comment");
    }
  };

  if (!isAuthenticated) {
    return (
      <Card size="small" style={{ textAlign: "center", marginBottom: "16px" }}>
        <Text type="secondary">Please log in to comment</Text>
      </Card>
    );
  }

  return (
    <div style={{ marginBottom: "16px" }}>
      <TextArea
        rows={3}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        style={{ marginBottom: "8px" }}
      />
      <Space>
        <Button
          type="primary"
          onClick={handleSubmit}
          loading={loading}
          disabled={!content.trim()}
        >
          {buttonText}
        </Button>
        {onSuccess && <Button onClick={() => onSuccess()}>Cancel</Button>}
      </Space>
    </div>
  );
};

const CommentItem = ({ comment, level = 0, postId, onCommentAdded }) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { like: likeLoading } = useSelector(selectCommentsLoading);

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [showReplyForm, setShowReplyForm] = useState(false);

  const canEdit = isAuthenticated && user?.user_id === comment.author_id;
  const isLiked = comment.user_liked === true;
  const isDisliked = comment.user_liked === false;
  const maxDepth = 2;

  const handleEdit = async () => {
    if (!editText.trim()) {
      message.error("Please enter comment content");
      return;
    }

    try {
      await dispatch(
        updateComment({
          commentId: comment.comment_id,
          content: editText.trim(),
        })
      ).unwrap();

      setIsEditing(false);
      message.success("Comment updated successfully");
    } catch (error) {
      message.error(error || "Failed to update comment");
    }
  };

  const handleCancelEdit = () => {
    setEditText(comment.content);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteComment(comment.comment_id)).unwrap();
      message.success("Comment deleted successfully");
    } catch (error) {
      message.error(error || "Failed to delete comment");
    }
  };

  const handleLike = async (likeType) => {
    if (!isAuthenticated) {
      message.warning("Please log in to like comments");
      return;
    }

    try {
      const result = await dispatch(
        toggleCommentLike({
          commentId: comment.comment_id,
          likeType,
        })
      ).unwrap();
      
      // Show success message based on action
      if (likeType === 'like') {
        if (result.liked === true) {
          message.success("Comment liked!");
        } else {
          message.success("Comment like removed!");
        }
      } else {
        if (result.liked === false) {
          message.success("Comment disliked!");
        } else {
          message.success("Comment dislike removed!");
        }
      }
    } catch (error) {
      message.error(error || "Failed to like comment");
    }
  };

  const commentStyle = {
    marginLeft: `${level * 24}px`,
    marginBottom: "16px",
    padding: "12px",
    backgroundColor: level % 2 === 0 ? "#fff" : "#fafafa",
    borderLeft: level > 0 ? "2px solid #e6f7ff" : "none",
    borderRadius: "6px",
    border: "1px solid #f0f0f0",
  };

  return (
    <div style={commentStyle}>
      <div style={{ display: "flex", gap: "12px" }}>
        <Avatar src={comment.profile_picture} size="small">
          {comment.username?.[0]?.toUpperCase()}
        </Avatar>

        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "8px",
            }}
          >
            <Text strong>{comment.username}</Text>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {new Date(comment.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </Text>
            {comment.is_edited && (
              <Text type="secondary" style={{ fontSize: "11px" }}>
                (edited)
              </Text>
            )}
          </div>

          {isEditing ? (
            <div>
              <TextArea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={3}
                style={{ marginBottom: "8px" }}
              />
              <Space>
                <Button size="small" type="primary" onClick={handleEdit}>
                  Save
                </Button>
                <Button size="small" onClick={handleCancelEdit}>
                  Cancel
                </Button>
              </Space>
            </div>
          ) : (
            <div>
              <Text style={{ whiteSpace: "pre-wrap" }}>{comment.content}</Text>

              <div
                style={{
                  marginTop: "8px",
                  display: "flex",
                  gap: "16px",
                  alignItems: "center",
                }}
              >
                <Space size="small">
                  <Button
                    type="text"
                    size="small"
                    icon={isLiked ? <LikeFilled /> : <LikeOutlined />}
                    onClick={() => handleLike("like")}
                    style={{
                      color: isLiked ? "#1890ff" : undefined,
                      padding: "0 4px",
                    }}
                    loading={likeLoading}
                  >
                    {comment.like_count || 0}
                  </Button>

                  <Button
                    type="text"
                    size="small"
                    icon={isDisliked ? <DislikeFilled /> : <DislikeOutlined />}
                    onClick={() => handleLike("dislike")}
                    style={{
                      color: isDisliked ? "#ff4d4f" : undefined,
                      padding: "0 4px",
                    }}
                    loading={likeLoading}
                  >
                    {comment.dislike_count || 0}
                  </Button>
                </Space>

                {level < maxDepth && (
                  <Button
                    type="text"
                    size="small"
                    icon={<MessageOutlined />}
                    onClick={() => setShowReplyForm(!showReplyForm)}
                    style={{ padding: "0 4px" }}
                  >
                    Reply
                  </Button>
                )}

                {canEdit && (
                  <Space size="small">
                    <Button
                      type="text"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => setIsEditing(true)}
                      style={{ padding: "0 4px" }}
                    />
                    <Button
                      type="text"
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={handleDelete}
                      danger
                      style={{ padding: "0 4px" }}
                    />
                  </Space>
                )}
              </div>

              {showReplyForm && (
                <div style={{ marginTop: "12px" }}>
                  <CommentForm
                    postId={postId}
                    parentId={comment.comment_id}
                    onSuccess={() => setShowReplyForm(false)}
                    onCommentAdded={onCommentAdded}
                    placeholder="Write a reply..."
                    buttonText="Reply"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div style={{ marginTop: "12px" }}>
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.comment_id}
              comment={reply}
              level={level + 1}
              postId={postId}
              onCommentAdded={onCommentAdded}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const Comments = ({ postId }) => {
  const dispatch = useDispatch();
  const comments = useSelector(selectComments);
  const { fetch: loading } = useSelector(selectCommentsLoading);
  const errors = useSelector(selectCommentsErrors);

  useEffect(() => {
    if (postId) {
      dispatch(fetchPostComments(postId));
    }
  }, [dispatch, postId]);

  const handleCommentAdded = () => {
    // Refetch comments when a new comment is added
    dispatch(fetchPostComments(postId));
  };

  if (loading) {
    return (
      <Card title="Comments" style={{ marginTop: "24px" }}>
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  if (errors.fetch) {
    return (
      <Card title="Comments" style={{ marginTop: "24px" }}>
        <Empty description={`Error loading comments: ${errors.fetch}`} />
      </Card>
    );
  }

  // Filter to get only top-level comments (no parent)
  const topLevelComments = comments.filter(
    (comment) => !comment.parent_comment_id
  );

  return (
    <Card title="Comments" style={{ marginTop: "24px" }}>
      <CommentForm postId={postId} onCommentAdded={handleCommentAdded} />

      <Divider />

      {topLevelComments.length === 0 ? (
        <Empty description="No comments yet. Be the first to comment!" />
      ) : (
        <div>
          {topLevelComments.map((comment) => (
            <CommentItem
              key={comment.comment_id}
              comment={comment}
              level={0}
              postId={postId}
              onCommentAdded={handleCommentAdded}
            />
          ))}
        </div>
      )}
    </Card>
  );
};

export default Comments;
