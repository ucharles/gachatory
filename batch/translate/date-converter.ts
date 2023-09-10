import mongoose from "mongoose";
import { ObjectId } from "mongodb";
import CapsuleToy from "../models/capsule-model";

const uri: string = process.env.DATABASE_URL ?? "";

mongoose
  .connect(uri)
  .then(async () => {
    console.log("Connected to MongoDB");

    // Regex to match pattern "2023年7月" and capture "2023年", "7", and "月"
    const regex: RegExp = /(\d{4}年)(\d)(月)/;

    const capsules = await CapsuleToy.find({ date: regex });
    console.log("Length of result:", capsules.length);
    console.log("Type of result:", typeof capsules);

    for (const capsule of capsules) {
      // Check if date field matches the regex
      if (regex.test(capsule.date)) {
        console.log("Matched:", capsule.date);
        // Replace single-digit month with zero-padded month
        const newDate: string = capsule.date.replace(
          regex,
          (match: String, p1: String, p2: String, p3: String) =>
            p1 + "0" + p2 + p3
        );

        try {
          console.log("Capsule id:", capsule.id);
          const capsuleToUpdate = await CapsuleToy.findById(
            new ObjectId(capsule.id)
          ).exec();

          if (!capsuleToUpdate) {
            console.log("Capsule not found");
            return;
          }
          capsuleToUpdate.date = newDate;
          await capsuleToUpdate.save();
        } catch (err) {
          console.error(err);
        }
      }
    }
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });
