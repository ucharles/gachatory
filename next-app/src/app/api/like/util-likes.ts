import { ILike } from "@/lib/models/like-model";
import { ILocalization } from "@/lib/models/localization-model";
import { dateTranslator } from "@/lib/date-converter";

const IMAGE_SERVER_URL = process.env.IMAGE_SERVER_URL;

export function editLikes(likes: ILike[], lng: string | null) {
  // 캡슐 정보 편집

  likes = likes.map((like: any) => {
    const plainLike = like.toObject(); // convert Mongoose document to plain JavaScript object

    if (
      plainLike.capsuleId.img === "" &&
      plainLike.capsuleId.detail_img.length !== 0
    ) {
      plainLike.capsuleId.display_img = `${IMAGE_SERVER_URL}${plainLike.capsuleId.detail_img[0]}`;
    } else {
      plainLike.capsuleId.display_img = `${IMAGE_SERVER_URL}${plainLike.capsuleId.img}`;
    }
    plainLike.capsuleId.date = plainLike.capsuleId.date?.map((date: string) => {
      return dateTranslator(date, lng);
    });
    plainLike.capsuleId.localization?.forEach((language: ILocalization) => {
      if (language.lng === lng) {
        plainLike.capsuleId.name = language.name;
        plainLike.capsuleId.description = language.description;
        plainLike.capsuleId.header = language.header;
      }
    });
    delete plainLike.capsuleId.localization;
    return plainLike;
  });

  return likes;
}
