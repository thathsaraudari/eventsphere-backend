const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

const saltRounds = 10;
const privateKey = process.env.TOKEN_SECRET;

if (!privateKey) {
  console.warn('TOKEN_SECRET is not set. JWT signing/verification will fail!');
}

router.post('/signup', async (req, res, next) => {
  try {
    
    const { email, password, name, username } = req.body;
    const displayName = name || username;

    if (!email || !password || !displayName) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const foundUser = await User.findOne({ email });
    if (foundUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const createdUser = await User.create({
      email,
      password: hashedPassword,
      name: displayName,
    });

    let token = null;
    if (privateKey) {
      token = jwt.sign(
        { id: createdUser._id, email: createdUser.email },
        privateKey,
        { expiresIn: '7d' }
      );
    }

    return res.status(201).json({
      user: { id: createdUser._id, email: createdUser.email, name: createdUser.name },
      ...(token ? { token } : {}), 
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    if (!privateKey) {
      return res.status(500).json({ error: 'Server misconfigured: TOKEN_SECRET missing' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name },
      privateKey,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: { id: user._id, email: user.email, name: user.name },
    });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: 'Login failed' });
  }
});


router.get('/verify', (req, res) => {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });

    if (!privateKey) {
      return res.status(500).json({ error: 'Server misconfigured: TOKEN_SECRET missing' });
    }

    const decoded = jwt.verify(token, privateKey);
    return res.json({ valid: true, user: decoded });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
