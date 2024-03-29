import mongoose, { Document, Schema } from "mongoose";

interface localizationName {
  ko: string | string[];
  en: string | string[];
  ja: string | string[];
}

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  capsuleId: mongoose.Types.ObjectId;
  tagId: mongoose.Types.ObjectId;
  notificationId: mongoose.Types.ObjectId;
  capsule_name: localizationName;
  tag_name: localizationName;
  brand_name: localizationName;
  release_date: string;
  detail_url: string;
  img: string;
  confirmed: boolean;
  confirmedAt: Date;
}

export const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    capsuleId: {
      type: Schema.Types.ObjectId,
      ref: "CapsuleToy",
      required: true,
    },
    tagId: {
      type: Schema.Types.ObjectId,
      ref: "CapsuleTag",
      required: true,
    },
    notificationId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    capsule_name: {
      ko: {
        type: String,
        required: true,
      },
      en: {
        type: String,
        required: true,
      },
      ja: {
        type: String,
        required: true,
      },
    },
    tag_name: {
      ko: {
        type: [String],
        required: true,
      },
      en: {
        type: [String],
        required: true,
      },
      ja: {
        type: [String],
        required: true,
      },
    },
    brand_name: {
      ko: {
        type: String,
        required: true,
      },
      en: {
        type: String,
        required: true,
      },
      ja: {
        type: String,
        required: true,
      },
    },
    release_date: {
      type: String,
      required: true,
    },
    detail_url: {
      type: String,
      required: true,
    },
    img: {
      type: String,
      required: true,
    },
    confirmed: {
      type: Boolean,
    },
    confirmedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema, "notification");

export default Notification;
