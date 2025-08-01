const express = require("express");
const router = express.Router();
const { authenticateToken, authorizeRoles } = require("../middleware/auth");
const upload = require("../config/multer");
const User = require("../models/user.modal");
const profileController = require("../controllers/profile/profile.controller");

router.get("/check-admin", authenticateToken, (req, res) => {
  const isAdmin = req.user.role_name.toLowerCase() === "admin";
  if (!isAdmin) {
    return res
      .status(403)
      .json({ success: false, error: "Access denied. Admins only" });
  }
  res.json({
    success: true,
    isAdmin: isAdmin,
  });
});

router.get("/check-author", authenticateToken, (req, res) => {
  const isAuthor = req.user.role_name.toLowerCase() === "author";
  if (!isAuthor) {
    return res
      .status(403)
      .json({ success: false, error: "Access denied. Authors only" });
  }
  res.json({
    success: true,
    isAuthor: isAuthor,
  });
});

router.get("/profile", authenticateToken, profileController.getProfile);

router.put("/profile", authenticateToken, profileController.updateProfile);

router.put("/profile/image", authenticateToken, upload.single("avatar"), profileController.updateProfileImage);

router.put("/profile/complete", authenticateToken, upload.single("avatar"), profileController.updateProfileWithImage);

router.get(
  "/admin-only",
  authenticateToken,
  authorizeRoles("admin"),
  (req, res) => {
    res.json({
      success: true,
      message: "Admin access granted",
      user: req.user.username,
    });
  }
);

router.get(
  "/author-access",
  authenticateToken,
  authorizeRoles("admin", "author"),
  (req, res) => {
    res.json({
      success: true,
      message: "Author access granted",
      user: req.user.username,
    });
  }
);

router.get(
  "/admin/users",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const users = await User.getAllUsers();
      res.json({
        success: true,
        data: users,
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch users",
      });
    }
  }
);

router.put(
  "/admin/users/:userId/role",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      if (!["reader", "author", "admin"].includes(role)) {
        return res.status(400).json({
          success: false,
          error: "Invalid role. Must be reader, author, or admin",
        });
      }

      const updatedUser = await User.updateUserRole(userId, role);
      res.json({
        success: true,
        message: "User role updated successfully",
        data: updatedUser,
      });
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update user role",
      });
    }
  }
);

router.get(
  "/admin/posts",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const posts = await User.getAllPostsWithAuthors();
      res.json({
        success: true,
        data: posts,
      });
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch posts",
      });
    }
  }
);

module.exports = router;
