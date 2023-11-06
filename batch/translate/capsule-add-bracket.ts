import * as dotenv from "dotenv";
import * as path from "path";
const envPath = path.resolve(__dirname, "../.env");
dotenv.config({ path: envPath });

import mongoose from "mongoose";
import Localization from "../models/localization-model";
import { bracketMatcher } from "../utils/translate_utils";

const uri: string = process.env.DATABASE_URL ?? "";
console.log("DB URL:", uri);

mongoose
  .connect(uri)
  .then(async () => {
    console.log("Connected to MongoDB");

    const capsules = await Localization.find({
      name: new RegExp("[\\)\\]】]", "i"),
    }).sort({ _id: -1 });

    console.log("Capsules:", capsules.length);

    // mongoose model initialization

    for (let capsule of capsules) {
      console.log(capsule.name);
      const bracketMatchedName = bracketMatcher(capsule.name);

      capsule.name = bracketMatchedName;
      await capsule.save();
    }

    mongoose.disconnect();
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });
