import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";

const googleAuth = async (req, res, next) => {
  try {
    const googleEmail = req.user?._json?.email;
    const googleName = req.user?._json?.name;

    let user = await User.findOne({ email: googleEmail });

    if (!user) {
      user = await User.create({ name: googleName, email: googleEmail , isAccountVerified: true });
      console.log("✅ New Google User Created:", googleEmail);
    } else {
      console.log("✅ Existing Google User Found:", googleEmail);
    }

    // ✅ Generate JWT
    const token = generateToken(user);

    // ✅ Always set cookie with same name used in email/password flow
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // ✅ Attach to req if needed later
    req.dbUser = user;

    console.log("🧩 Google JWT:", token);
    next();
  } catch (error) {
    console.error("❌ Google Auth Middleware Error:", error);
    res.redirect("http://localhost:5173/login");
  }
};

export default googleAuth;
