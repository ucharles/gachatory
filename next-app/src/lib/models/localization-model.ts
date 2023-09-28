import mongoose, { Document, Schema } from "mongoose";
import { ICapsuleToy } from "./capsule-model";

export interface ILocalization extends Document {
  lng: string;
  brand: string;
  name: string;
  header: string;
  description: string;
  capsuleId: mongoose.Types.ObjectId | ICapsuleToy;
}

// schema with createAt, updateAt field
export const localizationSchema = new Schema(
  {
    lng: String,
    brand: String,
    name: String,
    header: String,
    description: String,
    capsuleId: {
      type: mongoose.Types.ObjectId,
      ref: "CapsuleToy",
    },
  },
  { timestamps: true }
);

const Localization =
  mongoose.models.Localization ||
  mongoose.model("Localization", localizationSchema, "localization");

export default Localization;
