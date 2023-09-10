import mongoose from "mongoose";
import { ObjectId } from "mongodb";
import CapsuleToy from "../models/capsule-model";

const uri: string = process.env.DATABASE_URL ?? "";

mongoose
  .connect(uri)
  .then(async () => {
    console.log("Connected to MongoDB");

    const regex: RegExp = /^\./;

    const capsules = await CapsuleToy.find({
      $or: [{ img: regex }, { detail_img: regex }],
    });
    console.log("Length of result:", capsules.length);

    for (const capsule of capsules) {
      // Check if date field matches the regex
      let newImg: string = capsule.img;
      let newDetailImg: string | string[] = capsule.detail_img;
      console.log(typeof newDetailImg);

      if (regex.test(capsule.img)) {
        // Replace single-digit month with zero-padded month
        newImg = capsule.img.substring(1);
        console.log("New img:", newImg);

        if (capsule.brand === "BANDAI") {
          newImg = "bandai" + newImg;
        } else if (capsule.brand === "Takara Tomy Arts") {
          newImg = "takaratomy" + newImg;
        }
      }
      if (typeof newDetailImg === "string") {
        if (regex.test(newDetailImg)) {
          console.log("Matched:", newDetailImg);
          // Replace single-digit month with zero-padded month
          newDetailImg = newDetailImg.substring(1);

          if (capsule.brand === "BANDAI") {
            newDetailImg = "bandai" + newDetailImg;
          } else if (capsule.brand === "Takara Tomy Arts") {
            newDetailImg = "takaratomy" + newDetailImg;
          }
        }
      } else if (Array.isArray(newDetailImg)) {
        newDetailImg = capsule.detail_img.map((detail_img: string) => {
          if (regex.test(detail_img)) {
            console.log("Matched:", detail_img);
            // Replace single-digit month with zero-padded month
            let newDetailImg: string = detail_img.substring(1);

            if (capsule.brand === "BANDAI") {
              newDetailImg = "bandai" + newDetailImg;
            } else if (capsule.brand === "Takara Tomy Arts") {
              newDetailImg = "takaratomy" + newDetailImg;
            }
            return newDetailImg;
          } else {
            return detail_img;
          }
        });
      }
      try {
        console.log("Capsule id:", capsule.id);
        const capsuleToUpdate = await CapsuleToy.findById(
          new ObjectId(capsule.id)
        ).exec();

        if (!capsuleToUpdate) {
          console.log("Capsule not found");
          return;
        }
        capsuleToUpdate.img = newImg;
        capsuleToUpdate.detail_img = newDetailImg;
        await capsuleToUpdate.save();
      } catch (err) {
        console.error(err);
      }
    }
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });
