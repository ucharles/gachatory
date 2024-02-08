import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "./user-model";

export interface IAccount extends Document {
  provider: string;
  type: string;
  providerAccountId: string;
  access_token: string;
  token_type: string;
  scope: string;
  id_token?: string;
  userId: mongoose.Types.ObjectId | IUser;
}

export const accountSchema = new Schema<IAccount>(
  {
    provider: String,
    type: String,
    providerAccountId: String,
    access_token: String,
    token_type: String,
    scope: String,
    id_token: String,
    userId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: false },
);

const Account =
  mongoose.models.Account ||
  mongoose.model("Account", accountSchema, "accounts");

export default Account;
