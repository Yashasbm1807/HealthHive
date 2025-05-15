// routes/users.js

import { Router } from 'express';
import { createUser, findUserByEmail, updateUserProfile } from '../data/users.js';
import bcrypt from 'bcryptjs';
import { loginMiddleware } from '../middleware.js';
import multer from 'multer';
import { ObjectId } from 'mongodb';

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Homepage
router.get('/', (req, res) => {
  res.render('home', {
    title: 'Health Hive - Welcome',
    showHeader: true,
    user: req.session.user || null
  });
});

// Registration page
router.get('/register', (req, res) => {
  res.render('register', { title: 'Register - Health Hive' });
});

router.post('/register', async (req, res) => {
  const { email, username, password, confirmPassword } = req.body;
  if (!email || !username || !password || !confirmPassword) {
    return res.status(400).render('register', { title: 'Register - Health Hive', error: 'All fields are required.' });
  }
  if (password !== confirmPassword) {
    return res.status(400).render('register', { title: 'Register - Health Hive', error: 'Passwords do not match.' });
  }
  try {
    await createUser(email, username, password);
    res.redirect('/login');
  } catch (e) {
    res.status(500).render('register', { title: 'Register - Health Hive', error: e.message || 'Something went wrong.' });
  }
});

// Login page
router.get('/login', (req, res) => {
  res.render('login', { title: 'Login - Health Hive' });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).render('login', { title: 'Login - Health Hive', error: 'Both email and password are required.' });
  }

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(400).render('login', { title: 'Login - Health Hive', error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).render('login', { title: 'Login - Health Hive', error: 'Invalid email or password.' });
    }

    req.session.user = {
      _id: user._id.toString(),
      username: user.username,
      email: user.email,
      bio: user.bio || '',
      profilePhoto: user.profilePhoto?.toString('base64') || ''
    };

    res.redirect('/');
  } catch (e) {
    res.status(500).render('login', { title: 'Login - Health Hive', error: e.message || 'Something went wrong.' });
  }
});

// User dashboard
router.get('/user', loginMiddleware, (req, res) => {
  const { username, email } = req.session.user;
  res.render('user', { title: 'Your Dashboard - Health Hive', username, email });
});

// Profile page
router.get('/profile', loginMiddleware, (req, res) => {
  const { username, email, bio, profilePhoto } = req.session.user;
  res.render('profile', { title: 'Edit Profile - Health Hive', username, email, bio, profilePhoto });
});

// Handle profile update
router.post('/profile', loginMiddleware, upload.single('profilePhoto'), async (req, res) => {
  const { bio } = req.body;
  const profilePhoto = req.file ? req.file : null;

  try {
    const updatedUser = await updateUserProfile(new ObjectId(req.session.user._id), bio.trim(), profilePhoto?.buffer);
    req.session.user.bio = updatedUser.bio;
    req.session.user.profilePhoto = updatedUser.profilePhoto?.toString('base64') || '';

    res.render('profile', {
      title: 'Edit Profile - Health Hive',
      username: req.session.user.username,
      email: req.session.user.email,
      bio: updatedUser.bio,
      profilePhoto: req.session.user.profilePhoto,
      success: 'Profile updated successfully.'
    });
  } catch (e) {
    res.status(400).render('profile', {
      title: 'Edit Profile - Health Hive',
      username: req.session.user.username,
      email: req.session.user.email,
      bio: req.session.user.bio,
      profilePhoto: req.session.user.profilePhoto,
      error: e.message || 'Failed to update profile.'
    });
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).render('error', { title: 'Error', error: 'Logout failed. Please try again.' });
    }
    res.clearCookie('AuthCookie');
    res.set('Cache-Control', 'no-store');
    res.redirect('/');
  });
});

export default router;
