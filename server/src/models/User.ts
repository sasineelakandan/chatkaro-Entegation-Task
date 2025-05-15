// models/User.js
import { Schema, model } from "mongoose";
import { userValidators } from "./User.validator"; // Adjust path if needed

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      validate: {
        validator: userValidators.username.validator,
        message: userValidators.username.message,
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: userValidators.email.validator,
        message: userValidators.email.message,
      },
    },
    password: {
      type: String,
      required: true,
      validate: {
        validator: userValidators.password.validator,
        message: userValidators.password.message,
      },
    },
    avatar: {
      type: String, 
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
    },
    socketId: {
      type: String,
    },
  },
  {
    timestamps: true, 
  }
);

export default model("User", UserSchema);
