import mongoose from "mongoose";

export function convertToObjectId(id: string): mongoose.Types.ObjectId {
  return new mongoose.Types.ObjectId(id);
}
