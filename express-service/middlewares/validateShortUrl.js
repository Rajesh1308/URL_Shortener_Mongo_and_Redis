import URL from "../models/url.js";

const shortIdValidate = async (req, res, next) => {
  const shortId = req.body?.shortId || req.params?.shortId;
  const userId = req.userId;
  try {
    const entry = await URL.findOne({ shortId });
    if (!entry) {
      return res.json({
        success: false,
        error: {
          message: "ShortId not found",
        },
      });
    }
    if (entry.createdBy.toString() !== userId) {
      return res.json({
        success: false,
        error: {
          message: "Access denied",
        },
      });
    }
    next();
  } catch (e) {
    console.log(e.message);
    return res.json({
      success: false,
      error: {
        message: e.message,
      },
    });
  }
};

export default shortIdValidate;
