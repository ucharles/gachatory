import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  provider: string;
  emailVerified: boolean;
}

export const userSchema = new Schema<IUser>(
  {
    username: String,
    email: String,
    provider: String,
    emailVerified: Boolean,
  },
  { timestamps: true }
);

const User =
  mongoose.models.User || mongoose.model("User", userSchema, "users");

export default User;
