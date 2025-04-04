const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const generateToken = (user) => {
  const payload = {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({
      name,
      email,
      password,
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const token = generateToken(user);
    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const token = generateToken(user);
    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const getUser = async (req, res) => {
  try {
    console.log('Fetching user with ID:', req.user.id);
    const user = await User.findById(req.user.id).select('-password');
    console.log('Fetched user:', user);
    res.json(user);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).send('Server error');
  }
};

module.exports = { register, login, getUser };
