const { pool } = require("../../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
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

exports.register = async (req, res) => {
  const { username, password, userEmail, roleName } = req.body;
  if (!username || !password || !userEmail || !roleName) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    let profilePictureUrl = null;

    if (req.file) {
      profilePictureUrl = await uploadToCloudinary(req.file.buffer);
    }

    let roleId;

    const checkRole = await pool.query(
      "SELECT role_id FROM roles WHERE role_name = $1",
      [roleName]
    );
    if (checkRole.rows.length > 0) {
      roleId = checkRole.rows[0].role_id;
    } else {
      roleId = await User.createRole(roleName);
    }
    const existingUser = await User.getUserByEmail(userEmail);
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userId = await User.registerUser(
      username,
      hashedPassword,
      userEmail,
      profilePictureUrl,
      roleId
    );

    res
      .status(201)
      .json({ success: true, message: "User registered successfully" });
  } catch (error) {
    console.error("Error during registration:", error.message);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

exports.login = async (req, res) => {
  const { userEmail, password } = req.body;
  if (!userEmail || !password) {
    return res
      .status(400)
      .json({ success: false, error: "Email and password are required" });
  }

  try {
    const user = await User.getUserByEmail(userEmail);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid password" });
    }

    const token = jwt.sign(
      { userId: user.user_id, roleId: user.role_id },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d",
      }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: token,
    });
  } catch (error) {
    console.error("Error during login:", error.message);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};
