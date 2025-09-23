import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { userModel } from "../models/userModel.js";

export const handleSignup = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      error: { message: "Missing required data" },
    });
  }

  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: { message: "User with this email already exists" },
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    // Send JWT token
    // const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    //   expiresIn: "7d",
    // });
    // console.log(process.env.NODE_ENV === "production");
    // console.log(process.env.NODE_ENV === "production" ? "strict" : "lax");

    // res.cookie("token", token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    //   maxAge: 7 * 24 * 60 * 60 * 1000,
    // });

    return res.json({
      success: true,
      message: "User created successfully",
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      error: { message: e.message },
    });
  }
};

export const handleLogin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.json({
      success: false,
      error: {
        message: "Missing required fields",
      },
    });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({
        success: true,
        error: {
          message: "User not found",
        },
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({
        success: false,
        error: {
          message: "Incorrect email or password",
        },
      });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 24 * 7 * 60 * 60 * 1000,
    });
    res.json({
      success: true,
      message: "Login successful",
    });
  } catch (e) {
    return res.json({
      success: false,
      error: {
        message: e.message,
      },
    });
  }
};

export const handleLogout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  });

  return res.json({
    success: true,
    message: "Logout successful",
  });
};
