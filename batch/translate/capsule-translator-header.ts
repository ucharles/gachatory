import mongoose from "mongoose";
import CapsuleToy, { ICapsuleToy } from "../models/capsule-model";
import Localization, { ILocalization } from "../models/localization-model";
import * as deepl from "deepl-node";
import * as logger from "../utils/logger";

const uri: string = process.env.DATABASE_URL ?? "";

const authKey: string = process.env.DEEPL_AUTH_KEY ?? "";
const translator = new deepl.Translator(authKey);

mongoose
  .connect(uri)
  .then(async () => {
    console.log("Connected to MongoDB");

    const capsules = await CapsuleToy.aggregate([
      { $sort: { _id: -1 } },
      {
        $lookup: {
          from: "localization", // 조인할 컬렉션 이름
          localField: "_id", // 현재 컬렉션의 조인할 대상 필드
          foreignField: "capsuleId", // 조인할 대상 컬렉션의 필드
          as: "localization", // 조회 결과를 저장할 필드 이름
        },
      },
      {
        $match: {
          "localization.header": "",
        },
      },
    ])
      .limit(30)
      .exec();

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
      const translated = await Localization.find({
        capsuleId: capsule._id,
      }).exec();

      const locKo = translated.find((loc: ILocalization) => loc.lng === "ko");
      const locEn = translated.find((loc: ILocalization) => loc.lng === "en");

      // translate ja to ko
      const resultJaToKo = (await translator.translateText(
        capsule.header,
        "ja",
        "ko"
      )) as deepl.TextResult;

      locKo.header = resultJaToKo.text;

      logger.logInfo(
        `Edit header. id: ${locKo.capsuleId}, lng: ${locKo.lng}, brand: "${locKo.brand}", name: "${locKo.name}", header: "${locKo.header}", description: "${locKo.description}"`
      );

      // translate ja to ko
      const resultJaToEn = (await translator.translateText(
        capsule.header,
        "ja",
        "en-US"
      )) as deepl.TextResult;

      locEn.header = resultJaToEn.text;

      logger.logInfo(
        `Edit header. id: ${locEn.capsuleId}, lng: ${locEn.lng}, brand: "${locEn.brand}", name: "${locEn.name}", header: "${locEn.header}", description: "${locEn.description}"`
      );

      try {
        const sess = await mongoose.startSession();
        await sess.withTransaction(async () => {
          await locKo.save();
          await locEn.save();
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
