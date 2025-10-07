const User = require('../models/User');

/**
 * Check if user exists by email or username
 */
const checkUserExists = async (email, username, excludeUserId = null) => {
  const query = { $or: [{ email }, { username }] };
  
  if (excludeUserId) {
    query._id = { $ne: excludeUserId };
  }
  
  return await User.findOne(query);
};

/**
 * Create user helper
 */
const createUser = async (userData) => {
  const { username, email, password, firstName, lastName, role = 'user' } = userData;
  
  // Check if user exists
  const existingUser = await checkUserExists(email, username);
  
  if (existingUser) {
    throw new Error(
      existingUser.email === email 
        ? 'Email already registered' 
        : 'Username already taken'
    );
  }
  
  // Create new user
  const user = new User({
    username,
    email,
    password,
    firstName,
    lastName,
    role
  });
  
  await user.save();
  return user;
};

module.exports = {
  checkUserExists,
  createUser
};

