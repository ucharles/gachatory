import mongoose, { Document, Schema } from "mongoose";
import { ILocalization } from "./localization-model";
import { ICapsuleTag } from "./capsule-tag-model";

// 인터페이스와 모델에서 _id를 string, String으로 정의하면 findById()에서 검색이 안됨

export interface ICapsuleToy extends Document {
  brand: string;
  name: string;
  price: number;
  date: string[];
  img: string;
  header?: string;
  detail_url: string;
  detail_img: string[];
  description: string;
  tagId: ICapsuleTag[];
  newest?: boolean;
  display_img?: string;
  localization?: ILocalization[];
  originalName?: string;
  dateISO?: Date[];
  like?: boolean;
}

export const capsuleToySchema = new Schema<ICapsuleToy>(
  {
    brand: String,
    name: String,
    price: Number,
    date: [String],
    img: String,
    header: String,
    detail_url: String,
    detail_img: [String],
    description: String,
    newest: Boolean,
    tagId: [{ type: mongoose.Types.ObjectId, ref: "CapsuleTag" }],
    localization: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Localization",
      },
    ],
  },
  { timestamps: true },
);

const CapsuleToy =
  mongoose.models.CapsuleToy ||
  mongoose.model("CapsuleToy", capsuleToySchema, "capsule-toy");

export default CapsuleToy;
