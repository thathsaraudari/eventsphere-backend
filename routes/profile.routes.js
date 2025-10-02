const router = require('express').Router();
const User = require('../models/User.model');
const { isAuthenticated } = require('../middlewares/jwt.middleware');

router.get('/', isAuthenticated, async (req, res) => {
  const user = await User.findById(req.user._id);
  return res.json({ user });
});

router.patch('/', isAuthenticated, async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      prefix,
      jobTitle,
      phoneNumber,
      address,
    } = req.body;

    const updateFields = {};
    if (firstName) updateFields.firstName = firstName.trim();
    if (lastName) updateFields.lastName = lastName.trim();
    if (prefix) updateFields.prefix = prefix.trim();
    if (jobTitle) updateFields.jobTitle = jobTitle.trim();
    if (phoneNumber) updateFields.phoneNumber = phoneNumber.trim();
    if (address) {
      updateFields.address = {
      line1: address.line1?.trim(),
      line2: address.line2?.trim(),
      city: address.city?.trim(),
      country: address.country?.trim(),
      zipcode: address.zipcode?.trim()
      };
    }

    if (Object.keys(updateFields).length === 0) {
      return res.json({ user: req.user });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateFields },
      { new: true }
    );

    return res.json({ user: updatedUser });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
