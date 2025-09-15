const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");

const saltRounds = 10;
const privateKey = process.env.TOKEN_SECRET;

router.post("/signup", async (req, res, next) => {
    try {
        const { email, password, name } =req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ message: "Missing required fields"});
        }

        const foundUser = await User.findOne({ email });
        if(foundUser) {
            return res.status(400).json({ message: "Email already exists"});
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const createdUser = await User.create({
            email,
            password: hashedPassword,
            name,
        });

        res.status(201).json({ user: {email : createdUser.email} });
    } catch (error) {
        next(error);
    }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });
    console.log(process.env.TOKEN_SECRET);
    const token = jwt.sign(
      { id: user._id, email: user.email },
      privateKey,
      { expiresIn: "7d" }
    );

    res.json({ token });
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: "Login failed" });
  }
});

router.get("/verify", (req, res) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token" });

    const decoded = jwt.verify(token, privateKey);
    res.json({ valid: true, user: decoded });
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});

module.exports = router;
