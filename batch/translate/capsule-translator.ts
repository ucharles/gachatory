import * as dotenv from "dotenv";
import * as path from "path";
const envPath = path.resolve(__dirname, "../.env");
dotenv.config({ path: envPath });

import mongoose from "mongoose";
import CapsuleToy from "../models/capsule-model";
import Localization from "../models/localization-model";
import * as deepl from "deepl-node";
import { brandTranslator } from "../utils/brand-translator";
import { arrayOrganizer } from "../utils/array-organizer";
import * as logger from "../utils/logger";

const uri: string = process.env.DATABASE_URL ?? "";
console.log("DB URL:", uri);
const authKey: string = process.env.DEEPL_AUTH_KEY ?? "";
console.log("authkey:", authKey);
const translator = new deepl.Translator(authKey);

mongoose
  .connect(uri)
  .then(async () => {
    console.log("Connected to MongoDB");

    const capsules = await CapsuleToy.find({
      name: new RegExp("^((?!箱売).)*$", "i"),
      localization: { $exists: false },
    })
      .sort({ _id: -1 })
      .limit(100);
    const capsuleCounts = await CapsuleToy.countDocuments({
      name: new RegExp("^((?!箱売).)*$", "i"),
      localization: { $exists: false },
    });

    console.log("Capsules:", capsuleCounts);

    // mongoose model initialization

    const usage = await translator.getUsage();
    if (usage.anyLimitReached()) {
      console.log("Translation limit exceeded.");
    }
    if (usage.character) {
      console.log(
        `Characters: ${usage.character.count} of ${usage.character.limit}`
      );
      logger.logInfo(
        `Characters: ${usage.character.count} of ${usage.character.limit}`
      ); // added by me
    }
    if (usage.document) {
      console.log(
        `Documents: ${usage.document.count} of ${usage.document.limit}`
      );
    }

    for (const capsule of capsules) {
      const locKo = new Localization({});
      const locEn = new Localization({});
      const ObejctIdKo = new mongoose.Types.ObjectId();
      const ObejctIdEn = new mongoose.Types.ObjectId();

      // console.log(capsule);
      const capsuleId = capsule._id;
      const brand = capsule.brand;
      const name = capsule.name;
      const header = capsule.header || "";
      const description = capsule.description || "";

      const originalArray = [name];
      header ? originalArray.push(header) : null;
      description ? originalArray.push(description) : null;

      // console.log(capsuleId, brand, name, header, description);

      let resultJaToKo: deepl.TextResult[];
      try {
        // translate ja to ko
        resultJaToKo = await translator.translateText(
          originalArray,
          "ja",
          "ko"
        );
      } catch (err) {
        console.error("Error Occured", err);
        logger.logError("Error Occured, record not saved");
      }

      const headesKo = arrayOrganizer(resultJaToKo, header, description);

      locKo._id = ObejctIdKo;
      locKo.lng = "ko";
      locKo.capsuleId = capsuleId;
      locKo.brand = brandTranslator(brand, "ko");
      locKo.name = resultJaToKo[0].text;
      locKo.header = headesKo.headerResult;
      locKo.description = headesKo.descriptionResult;

      logger.logInfo(
        `id: ${locKo.capsuleId}, lng: ${locKo.lng}, brand: "${locKo.brand}", name: "${locKo.name}", header: "${locKo.header}", description: "${locKo.description}"`
      );

      // translate ja to ko
      const resultJaToEn = await translator.translateText(
        originalArray,
        "ja",
        "en-US"
      );

      const headesEn = arrayOrganizer(resultJaToEn, header, description);

      locEn._id = ObejctIdEn;
      locEn.lng = "en";
      locEn.capsuleId = capsuleId;
      locEn.brand = brandTranslator(brand, "en");
      locEn.name = resultJaToEn[0].text;
      locEn.header = headesEn.headerResult;
      locEn.description = headesEn.descriptionResult;

      logger.logInfo(
        `id: ${locEn.capsuleId}, lng: ${locEn.lng}, brand: "${locEn.brand}", name: "${locEn.name}", header: "${locEn.header}", description: "${locEn.description}"`
      );

      try {
        const sess = await mongoose.startSession();
        await sess.withTransaction(async () => {
          await locKo.save();
          capsule.localization.push(ObejctIdKo);
          await locEn.save();
          capsule.localization.push(ObejctIdEn);
          await capsule.save();
        });
        sess.endSession();
      } catch (err) {
        console.error("Error Occured", err);
        logger.logError("Error Occured, record not saved");
      }
    }
    mongoose.disconnect();
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });
