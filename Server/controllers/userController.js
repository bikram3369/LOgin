import userModel from "../models/userModel.js";

export const getUserProfile = async (req, res) => {
  try {
    const { userId, userEmail } = req.body;

    // Handle both normal login and Google login
    const user = userId
      ? await userModel.findById(userId)
      : await userModel.findOne({ email: userEmail });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    return res.json({
      success: true,
      userData: {
        name: user.name,
        email: user.email,
        isAccountVerified: user.isAccountVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
