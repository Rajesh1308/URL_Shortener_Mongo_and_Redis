import jwt from "jsonwebtoken";

const userAuth = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json({
      success: false,
      message: "Missing token in request",
    });
  }

  try {
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
    if (tokenDecode.id) {
      req.userId = tokenDecode.id;
    } else {
      return res.json({
        success: false,
        message: "Invalid token",
      });
    }
    next();
  } catch (e) {
    return res.json({
      success: false,
      error: {
        message: e.message,
      },
    });
  }
};

export default userAuth;
