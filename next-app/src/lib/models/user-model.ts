import mongoose, { Document, Schema } from "mongoose";

interface IEmailNotification {
  keyword: boolean;
}

export interface IUser extends Document {
  username: string;
  email: string;
  provider: string;
  emailVerified: boolean;
  emailNotification: IEmailNotification;
}

export const userSchema = new Schema<IUser>(
  {
    username: String,
    email: String,
    provider: String,
    emailVerified: Boolean,
    emailNotification: Object,
  },
  { timestamps: true },
);

const User =
  mongoose.models.User || mongoose.model("User", userSchema, "users");

export default User;
