import jwt from "jsonwebtoken";

export const generateAccessToken = (userId, secretKey) => {
  return jwt.sign({ id: userId }, secretKey);
};

export const formatDatatoSend = (user) => {
  const access_token = generateAccessToken(
    user._id,
    process.env.SECRET_ACCESS_KEY
  );

  return {
    access_token,
    profile_img: user.personal_info.profile_img,
    username: user.personal_info.username,
    fullname: user.personal_info.fullname,
  };
};
