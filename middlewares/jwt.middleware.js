const jwt = require("jsonwebtoken");

function isAuthenticated(req, res, next) {
    try {
        if (
            req.headers.authotization.split(" ")[0] === "Bearer" &&
            req.hearders.authotization.split(" ")[1]
        ) {
            const theToken = req.hearders.authotization.split(" ")[1];
            const theData = jwt.verify(theToken, process.env.TOKEN_SECRET);
            req.hearders.payload = theData;
            next();
        } else {
            req.status(400).json( { errorMessage: "no token"});
        } 
  } catch (error) {
            res.status(403).json({ errorMessage: "Invalid Token"});
        }
}

modile.exports = { isAuthenticated };