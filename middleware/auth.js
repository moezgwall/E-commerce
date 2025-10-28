const USERDB = require("../models/user");
const jwt = require("jsonwebtoken");
require("dotenv").config();
module.exports = async (req, res, next) => {
  try {
    const header = req.headers["authorization"];
    if (!header) {
      return res.status(401).json({ error: "no token provided" });
    }
    const token = header.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "token invalid format" });
    }

    // expected payload on success
    // verify the payload format {id,username,email, role};
    // id : ****._id;

    const decodedToken = jwt.verify(token, process.env.SEC_KEY);

    const fuser = await USERDB.findById(decodedToken.id);
    if (!fuser) {
      return res.status(401).json({ error: "user not found" });
    }
    req.user = fuser;
    next();
  } catch (error) {
    console.error("error message : ", error.message);
    return res
      .status(500)
      .json({ message: "internal server error", error: error.message });
  }
};
