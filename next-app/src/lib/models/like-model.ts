import mongoose, { Document, Schema } from "mongoose";

export interface ILike extends Document {
  userId: mongoose.Types.ObjectId;
  capsuleId: mongoose.Types.ObjectId;
  state: boolean;
}

export const likeSchema = new Schema<ILike>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    capsuleId: { type: Schema.Types.ObjectId, ref: "CapsuleToy" },
    state: Boolean,
  },
  { timestamps: true },
);

const Like = mongoose.models.Like || mongoose.model("Like", likeSchema);

export default Like;
