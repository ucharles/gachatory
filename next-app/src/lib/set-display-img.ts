import { ICapsuleToy } from "./models/capsule-model";

export function setDisplayImg(capsules: ICapsuleToy[], prepare: boolean) {
  capsules.map((capsule: ICapsuleToy) => {
    if (capsule.img) {
      capsule.display_img = capsule.img;
    } else if (capsule.detail_img.length > 0) {
      capsule.display_img = capsule.detail_img[0];
    } else {
      prepare === true
        ? (capsule.display_img = "/images/prepare.jpg")
        : (capsule.display_img = "");
    }
  });
}
