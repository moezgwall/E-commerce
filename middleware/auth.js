const User = require("../models/user");

module.exports = async (req, res, next) => {
  const userID = req.headers["x-user-id"];
  if (!userID) {
    return res.status(401).json({ error: " no user id provided" });
  }

  const user = await User.findById(userID);
  if (!user) {
    return res.status(401).json({ error: " invalid user" });
  }

  req.user = user;
  next();
};
