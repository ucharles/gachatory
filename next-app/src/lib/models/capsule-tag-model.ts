import mongoose, { Document, Schema } from "mongoose";

export interface ICapsuleTag extends Document {
  ja: string[];
  ko: string[];
  en: string[];
  property: string;
  linkCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICapsuleTagSubscription extends ICapsuleTag {
  subscription: boolean;
}

export const tagSchema = new Schema<ICapsuleTag>(
  {
    ja: [String],
    ko: [String],
    en: [String],
    property: String,
    linkCount: Number,
  },
  { timestamps: true },
);

const CapsuleTag =
  mongoose.models.CapsuleTag ||
  mongoose.model("CapsuleTag", tagSchema, "capsule-tag");

export default CapsuleTag;
