import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.json({ success: false, message: "Not Authorized, Login again" });
  }

  try {
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Support both normal and Google login
    if (tokenDecode.id || tokenDecode.email) {
      req.body = req.body || {};
      req.body.userId = tokenDecode.id || null;
      req.body.userEmail = tokenDecode.email || null;
      console.log("✅ User Authenticated:", tokenDecode);
      next();
    } else {
      return res.json({
        success: false,
        message: "Invalid token payload, please login again.",
      });
    }
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export default userAuth;
