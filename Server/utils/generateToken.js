import jwt from "jsonwebtoken";


const generateToken = (user) => {

  const accessToken = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  return accessToken;
};
    

export default generateToken;
