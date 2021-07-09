const User = require("../Models/User");

const isAuthenticated = async (req, res, next) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization.replace("Bearer ", "");

    const user = await User.findOne({ token: token }).select("account email");
    if (!user) {
      return res.status(401).json("Unothorized User");
    } else {
      req.user = user;
    }
    return next();
  } else {
    res.status(401).json("Unauthorized User");
  }
};

module.exports = isAuthenticated;
