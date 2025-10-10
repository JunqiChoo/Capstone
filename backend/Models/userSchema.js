const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
//User Schema
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["Admin"],//Only these values are allowed (Adddifferent user as necessary)
    default: "Admin",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  last_login_at: {
    type: Date,
  },
});


UserSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
  next();
});

UserSchema.methods.comparePassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};


const User = mongoose.model("User",UserSchema);
module.exports = User;