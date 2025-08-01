import { useState, useEffect } from "react";
import { Form, Input, Button, Card, Upload } from "antd";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { UploadOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updatePost, selectPostsLoading } from "../store/postsSlice";
import toast from "react-hot-toast";

const { TextArea } = Input;

const EditPost = () => {
  const [form] = Form.useForm();
  const [content, setContent] = useState("");
  const [featuredImage, setFeaturedImage] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const loading = useSelector(selectPostsLoading);

  const post = location.state?.post;

  useEffect(() => {
    if (post) {
      // Pre-fill form with existing post data
      form.setFieldsValue({
        title: post.title,
        excerpt: post.excerpt,
        tags: Array.isArray(post.tags) ? post.tags.join(", ") : post.tags || "",
      });
      setContent(post.content || "");
      setExistingImageUrl(post.featured_image || "");
    } else {
      // If no post data, redirect back to My Posts
      navigate("/dashboard/my-posts");
    }
  }, [post, form, navigate]);

  const handleSubmit = async (values, isDraft = false) => {
    if (!content.trim()) {
      toast.error("Please add content to your post");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("excerpt", values.excerpt);
      formData.append("content", content);
      formData.append("tags", values.tags);
      formData.append("status", isDraft ? "draft" : "published");

      if (featuredImage) {
        formData.append("featuredImage", featuredImage);
      }

      await dispatch(
        updatePost({
          postId: post.post_id || post.id,
          postData: formData,
        })
      ).unwrap();

      toast.success("Post updated successfully");
      navigate("/dashboard/my-posts");
    } catch (error) {
      console.error("Error updating post:", error);
      toast.error(error || "Failed to update post");
    }
  };

  const uploadProps = {
    beforeUpload: (file) => {
      const isImage = file.type === "image/jpeg" || 
                      file.type === "image/jpg" || 
                      file.type === "image/png" || 
                      file.type === "image/gif" ||
                      file.type === "image/webp";
      if (!isImage) {
        toast.error("You can only upload image files (JPEG, PNG, GIF, WebP)!");
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        toast.error("Image must be smaller than 2MB!");
        return false;
      }
      setFeaturedImage(file);
      setExistingImageUrl(""); // Clear existing image when new one is selected
      return false; // Prevent auto upload
    },
    onRemove: () => {
      setFeaturedImage(null);
    },
    fileList: featuredImage ? [featuredImage] : [],
    showUploadList: false,
  };

  const renderImagePreview = () => {
    if (featuredImage) {
      return (
        <div
          style={{
            marginTop: "12px",
            border: "1px solid #d9d9d9",
            borderRadius: "6px",
            padding: "12px",
            backgroundColor: "#fafafa",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <img
              src={URL.createObjectURL(featuredImage)}
              alt="New Preview"
              style={{
                width: "80px",
                height: "80px",
                objectFit: "cover",
                borderRadius: "4px",
                border: "1px solid #d9d9d9",
              }}
            />
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: "bold", fontSize: "14px" }}>
                {featuredImage.name}
              </p>
              <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>
                New image (will replace existing)
              </p>
            </div>
            <Button
              type="text"
              danger
              onClick={() => setFeaturedImage(null)}
              style={{ padding: "4px 8px" }}
            >
              Remove
            </Button>
          </div>
        </div>
      );
    }

    if (existingImageUrl) {
      return (
        <div
          style={{
            marginTop: "12px",
            border: "1px solid #d9d9d9",
            borderRadius: "6px",
            padding: "12px",
            backgroundColor: "#f9f9f9",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <img
              src={existingImageUrl}
              alt="Current Preview"
              style={{
                width: "80px",
                height: "80px",
                objectFit: "cover",
                borderRadius: "4px",
                border: "1px solid #d9d9d9",
              }}
            />
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: "bold", fontSize: "14px" }}>
                Current featured image
              </p>
              <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>
                Upload a new image to replace this one
              </p>
            </div>
            <Button
              type="text"
              danger
              onClick={() => setExistingImageUrl("")}
              style={{ padding: "4px 8px" }}
            >
              Remove Current
            </Button>
          </div>
        </div>
      );
    }

    return null;
  };

  if (!post) {
    return (
      <Card>
        <p>No post data found. Redirecting...</p>
      </Card>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/dashboard/my-posts")}
        >
          Back to My Posts
        </Button>
      </div>

      <Card title={`Edit Post: ${post.title}`} style={{ maxWidth: "100%" }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
        >
          <Form.Item
            name="title"
            label="Post Title"
            rules={[
              { required: true, message: "Please enter post title" },
              { min: 5, message: "Title must be at least 5 characters" },
            ]}
          >
            <Input
              placeholder="Enter an engaging title for your post"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="excerpt"
            label="Post Excerpt"
            rules={[
              { required: true, message: "Please enter post excerpt" },
              { min: 20, message: "Excerpt must be at least 20 characters" },
            ]}
          >
            <TextArea
              rows={3}
              placeholder="Write a brief description of your post"
            />
          </Form.Item>

          <Form.Item label="Featured Image">
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>
                {featuredImage
                  ? "Change Selected Image"
                  : "Upload New Featured Image"}
              </Button>
            </Upload>
            {renderImagePreview()}
          </Form.Item>

          <Form.Item label="Post Content" required>
            <div style={{ border: "1px solid #d9d9d9", borderRadius: "6px" }}>
              <CKEditor
                editor={ClassicEditor}
                data={content}
                config={{
                  toolbar: [
                    "heading",
                    "|",
                    "bold",
                    "italic",
                    "link",
                    "bulletedList",
                    "numberedList",
                    "|",
                    "outdent",
                    "indent",
                    "|",
                    "blockQuote",
                    "insertTable",
                    "undo",
                    "redo",
                  ],
                  placeholder: "Start writing your post content here...",
                }}
                onChange={(event, editor) => {
                  const data = editor.getData();
                  setContent(data);
                }}
              />
            </div>
          </Form.Item>

          <Form.Item
            name="tags"
            label="Tags"
            rules={[{ required: true, message: "Please enter tags" }]}
          >
            <Input placeholder="Enter tags separated by commas (e.g., technology, javascript, web)" />
          </Form.Item>

          <Form.Item>
            <div style={{ display: "flex", gap: "12px" }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading.update}
                size="large"
                style={{ flex: 1 }}
              >
                {loading.update ? "Updating..." : "Update & Publish"}
              </Button>
              <Button
                htmlType="submit"
                loading={loading.update}
                size="large"
                style={{ flex: 1 }}
                onClick={() =>
                  form
                    .validateFields()
                    .then((values) => handleSubmit(values, true))
                }
              >
                {loading.update ? "Saving..." : "Save as Draft"}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default EditPost;
