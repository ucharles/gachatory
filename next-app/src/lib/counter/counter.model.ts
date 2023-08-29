// 참고: https://supern0va.tistory.com/28

import mongoose, { models, Schema } from "mongoose";

export const CounterSchema = new Schema({
    _id: {
        type: String,
        required: true,
    },
    seq: {
        type: Number,
        default: 0,
    },
});

const Counter = models?.Counter || mongoose.model("Counter", CounterSchema);

export async function getNextSequenceValue(sequenceName: string) {
    const sequenceDocument = await Counter.findByIdAndUpdate(
        sequenceName,
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );

    return sequenceDocument.seq;
}

export default Counter;
