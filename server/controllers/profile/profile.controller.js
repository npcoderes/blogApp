const User = require("../../models/user.modal");
const cloudinary = require("../../config/cloudinary");

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ resource_type: "image" }, (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      })
      .end(buffer);
  });
};

// Get user profile
exports.getProfile = (req, res) => {
  res.json({
    success: true,
    data: {
      user_id: req.user.user_id,
      username: req.user.username,
      email: req.user.user_email,
      role: req.user.role_name,
      profile_picture: req.user.profile_picture,
      bio: req.user.bio,
      phone: req.user.phone,
      location: req.user.location,
      created_at: req.user.created_at,
    },
  });
};

// Update user profile (without image)
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { name, bio, phone, location } = req.body;
    
    // Prepare update data
    const updateData = {};
    if (name) updateData.username = name;
    if (bio !== undefined) updateData.bio = bio;
    if (phone !== undefined) updateData.phone = phone;
    if (location !== undefined) updateData.location = location;
    
    // Update user in database
    const updatedUser = await User.updateUser(userId, updateData);
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }
    
    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        user_id: updatedUser.user_id,
        username: updatedUser.username,
        email: updatedUser.user_email,
        role: updatedUser.role_name,
        profile_picture: updatedUser.profile_picture,
        bio: updatedUser.bio,
        phone: updatedUser.phone,
        location: updatedUser.location,
        created_at: updatedUser.created_at,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update profile",
    });
  }
};

// Update profile image specifically
exports.updateProfileImage = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No image file provided",
      });
    }

    // Upload image to Cloudinary
    const profilePictureUrl = await uploadToCloudinary(req.file.buffer);
    
    // Update user's profile picture in database
    const updatedUser = await User.updateUser(userId, { 
      profile_picture: profilePictureUrl 
    });
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }
    
    res.json({
      success: true,
      message: "Profile image updated successfully",
      profile_picture: profilePictureUrl,
      user: {
        user_id: updatedUser.user_id,
        username: updatedUser.username,
        email: updatedUser.user_email,
        role: updatedUser.role_name,
        profile_picture: updatedUser.profile_picture,
        bio: updatedUser.bio,
        phone: updatedUser.phone,
        location: updatedUser.location,
        created_at: updatedUser.created_at,
      },
    });
  } catch (error) {
    console.error("Update profile image error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update profile image",
    });
  }
};

// Combined update (profile + image)
exports.updateProfileWithImage = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { name, bio, phone, location } = req.body;
    
    // Prepare update data
    const updateData = {};
    if (name) updateData.username = name;
    if (bio !== undefined) updateData.bio = bio;
    if (phone !== undefined) updateData.phone = phone;
    if (location !== undefined) updateData.location = location;
    
    // Handle avatar upload if present
    if (req.file) {
      const profilePictureUrl = await uploadToCloudinary(req.file.buffer);
      updateData.profile_picture = profilePictureUrl;
    }
    
    // Update user in database
    const updatedUser = await User.updateUser(userId, updateData);
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }
    
    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        user_id: updatedUser.user_id,
        username: updatedUser.username,
        email: updatedUser.user_email,
        role: updatedUser.role_name,
        profile_picture: updatedUser.profile_picture,
        bio: updatedUser.bio,
        phone: updatedUser.phone,
        location: updatedUser.location,
        created_at: updatedUser.created_at,
      },
    });
  } catch (error) {
    console.error("Update profile with image error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update profile",
    });
  }
};
