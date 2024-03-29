import mongoose, { Document, Schema } from "mongoose";
import { ICapsuleTag } from "./capsule-tag-model";
import { IUser } from "./user-model";

export interface ISubscriptionTag extends Document {
  userId: mongoose.Types.ObjectId | IUser;
  tagId: mongoose.Types.ObjectId | ICapsuleTag;
  state: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const subscriptionTagSchema = new Schema<ISubscriptionTag>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tagId: {
      type: Schema.Types.ObjectId,
      ref: "CapsuleTag",
      required: true,
    },
    state: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true },
);

const SubscriptionTag =
  mongoose.models.SubscriptionTag ||
  mongoose.model("SubscriptionTag", subscriptionTagSchema, "subscription-tag");

export default SubscriptionTag;
