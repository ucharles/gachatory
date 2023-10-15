import mongoose from "mongoose";
import { ObjectId } from "mongodb";
import CapsuleToy from "../models/capsule-model";
import * as dotenv from "dotenv";
import * as path from "path";

const envPath = path.resolve(__dirname, "../.env");
dotenv.config({ path: envPath });

const uri: string = process.env.DATABASE_URL ?? "";

mongoose.connect(uri).then(async () => {
  console.log("Connected to MongoDB");

  // Regex to match pattern "2023年7月" and capture "2023年", "7", and "月"
  const regex: RegExp = /(\d{4}年)(\d)(月)/;

  await CapsuleToy.find({ dateISO: { $exists: false } })
    .exec()
    .then(async function (docs) {
      for (const doc of docs) {
        let newDateArray = [];
        for (const dateString of doc.date) {
          let parsedDate;
          const dateStr = dateString.trim();
          if (/^.*上旬.*$/.test(dateStr)) {
            parsedDate = new Date(
              `${dateStr.substr(0, 4)}-${dateStr.substr(5, 2)}-01`
            );
          } else if (/^.*中旬.*$/.test(dateStr)) {
            parsedDate = new Date(
              `${dateStr.substr(0, 4)}-${dateStr.substr(5, 2)}-15`
            );
          } else if (/^.*下旬.*$/.test(dateStr)) {
            const year = parseInt(dateStr.substr(0, 4));
            const month = parseInt(dateStr.substr(5, 2));
            const lastDay = new Date(year, month, 0).getDate();
            parsedDate = new Date(
              `${dateStr.substr(0, 4)}-${dateStr.substr(5, 2)}-${lastDay}`
            );
          } else {
            const year = parseInt(dateStr.substr(0, 4));
            const month = parseInt(dateStr.substr(5, 2));
            const lastDay = new Date(year, month, 0).getDate();
            parsedDate = new Date(
              `${dateStr.substr(0, 4)}-${dateStr.substr(5, 2)}-${lastDay}`
            );
          }
          newDateArray.push(parsedDate);
        }

        console.log(doc._id, newDateArray);
        // 업데이트를 `await`로 기다림
        await CapsuleToy.updateOne({ _id: doc._id }, { dateISO: newDateArray });
      }
    })
    .catch(function (err) {
      console.error(err);
    });
});
