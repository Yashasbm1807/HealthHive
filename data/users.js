// data/users.js

import bcrypt from 'bcryptjs';
import { users } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';
import multer from 'multer';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const saltRounds = 10;

export const createUser = async (email, username, password) => {
  if (!email || !username || !password) {
    throw new Error('All fields are required.');
  }

  email = email.trim().toLowerCase();
  username = username.trim();

  if (!email.includes('@') || !email.includes('.')) {
    throw new Error('Invalid email format.');
  }

  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }

  const userCollection = await users();
  const existingUser = await userCollection.findOne({ email });

  if (existingUser) {
    throw new Error('Email is already registered.');
  }

  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const newUser = {
    email,
    username,
    password: hashedPassword,
    bookmarks: [],
    role: 'user',
    profilePhoto: '',
    bio: '',
    createdAt: new Date()
  };

  const insertResult = await userCollection.insertOne(newUser);

  if (!insertResult.acknowledged || !insertResult.insertedId) {
    throw new Error('Could not create user.');
  }

  const createdUser = await userCollection.findOne({ _id: insertResult.insertedId });
  return createdUser;
};

export const findUserByEmail = async (email) => {
  if (!email) throw new Error('Email is required.');
  email = email.trim().toLowerCase();

  const userCollection = await users();
  const user = await userCollection.findOne({ email });

  return user;
};

export const updateUserProfile = async (userId, bio, profilePhoto) => {


  
  if (userId==null  || !ObjectId.isValid(userId)) {
    throw new Error('Invalid user ID.');
  }

  const userCollection = await users();
  
  const updateFields = {};

  if (typeof bio === 'string' && bio.trim() !== '') {
    updateFields.bio = bio.trim();
  }
   // or req.file if you want base64
  // const contentType = req.file.mimetype;
  // Send to data layer
  // await userData.saveUserPhoto(req.session.user._id, imageBuffer, contentType);
  updateFields.profilePhoto = profilePhoto;
  if (Object.keys(updateFields).length === 0) {
    throw new Error('No valid fields to update.');
  }
  const updatedUser = await userCollection.findOneAndUpdate(
    { _id: new ObjectId(userId) },
    { $set: updateFields },
    { returnDocument: 'after' }
  );
  console.log(updatedUser);
  if (updatedUser==null) {
    throw new Error('Could not update profile. User may not exist.');
  }

  return updatedUser;
};
