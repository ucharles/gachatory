import { ICapsuleToy } from "./models/capsule-model";
const IMAGE_URI = process.env.IMAGE_SERVER_URL || "";

export function setDisplayImg(capsules: ICapsuleToy[], prepare: boolean) {
  capsules.map((capsule: ICapsuleToy) => {
    if (capsule.img) {
      capsule.display_img = IMAGE_URI + capsule.img;
    } else if (capsule.detail_img.length > 0) {
      capsule.display_img = IMAGE_URI + capsule.detail_img[0];
    } else {
      prepare === true
        ? (capsule.display_img = IMAGE_URI + "/images/prepare.jpg")
        : (capsule.display_img = "");
    }
  });
}
