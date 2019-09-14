const mongoose = require("mongoose");
const userRoles = require("../config/roles");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
    allowNull: false
  },
  email: {
    type: String,
    unique: true,
    required: true,
    allowNull: false
  },
  password: {
    type: String,
    required: true,
    allowNull: false
  },

  isVerified: {
    type: Boolean,
    default: false
  },
  secretToken: {
    type: String
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  roles: [{ type: "String" }],
  role: {
    type: Number,
    default: userRoles.user,
    required: true,
    allowNull: false
  },
  date: {
    type: Date,
    default: () => {
      return new Date();
    }
  },
  followedStories: [
    {
      type: Schema.Types.ObjectId
    }
  ]
});

module.exports = User = mongoose.model("users", UserSchema);
