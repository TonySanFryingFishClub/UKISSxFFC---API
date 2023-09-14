import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
  deviceId: {
    type: String,
    required: true,
    unique: true,
  },
  address: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("User", UserSchema, "users");