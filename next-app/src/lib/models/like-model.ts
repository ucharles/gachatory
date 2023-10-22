import mongoose, { Document, Schema } from "mongoose";

export interface ILike extends Document {
  userId: string;
  capsuleId: string;
  state: boolean;
}

export const likeSchema = new Schema<ILike>(
  {
    userId: [{ type: mongoose.Types.ObjectId, ref: "User" }],
    capsuleId: [{ type: mongoose.Types.ObjectId, ref: "CapsuleToy" }],
    state: Boolean,
  },
  { timestamps: true }
);

const Like = mongoose.models.Like || mongoose.model("Like", likeSchema);

export default Like;
