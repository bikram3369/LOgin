import userModel from '../models/userModel.js';

export const getUserProfile = async (req, res) => {
    try {
        const userId = req.body.userId;
        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }
        return res.json({ success: true, userData :{
            name: user.name,
            email: user.email,
            isAccountVerified: user.isAccountVerified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        } });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

