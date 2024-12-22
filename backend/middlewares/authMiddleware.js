import { verifyAccessToken } from "../utils/authUtils.js";

export const verifyJWT = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader;

  if (token == null) {
    return res.status(401).json({ error: "No access token" });
  }

  try {
    const user = verifyAccessToken(token, process.env.SECRET_ACCESS_KEY);
    req.user = user.id;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Access token is invalid" });
  }
};
