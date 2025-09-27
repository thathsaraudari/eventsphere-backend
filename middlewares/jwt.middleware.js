const jwt = require("jsonwebtoken");
const User = require('../models/User.model');

async function isAuthenticated(req, res, next) {
    try {
        if (
            req.headers.authorization.split(" ")[0] === "Bearer" &&
            req.headers.authorization.split(" ")[1]
        ) {
            const theToken = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(theToken, process.env.TOKEN_SECRET);
            const user = await User.findById(decoded.id);
            if (!user) {
                res.status(401).json({ errorMessage: "User not found" });
                return;
            }
            req.user = user;
            next();
        } else {
            req.status(400).json( { errorMessage: "no token"});
        } 
  } catch (error) {
        console.log(error);
        res.status(403).json({ errorMessage: "Invalid Token" });
    }
}

module.exports = { isAuthenticated };