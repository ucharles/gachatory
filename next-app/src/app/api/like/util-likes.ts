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

    // 언어에 맞게 날짜 편집
    plainLike.capsuleId.date = plainLike.capsuleId.date?.map((date: string) => {
      return dateTranslator(date, lng);
    });

    // 언어에 맞게 이름, 설명, 헤더 편집
    plainLike.capsuleId.localization?.forEach((language: ILocalization) => {
      if (language.lng === lng) {
        plainLike.capsuleId.name = language.name;
        plainLike.capsuleId.description = language.description;
        plainLike.capsuleId.header = language.header;
      }
    });
    // localization 필드 삭제
    delete plainLike.capsuleId.localization;

    return plainLike;
  });

  return likes;
}

export function sortLikes(likes: ILike[], sortOrder: string, sortBy: string) {
  // 입력값에 따른 캡슐 정렬
  if (sortBy === "release") {
    likes = likes.sort((a: any, b: any) => {
      if (sortOrder === "asc") {
        return (
          new Date(a.capsuleId.dateISO[0]).getTime() -
          new Date(b.capsuleId.dateISO[0]).getTime()
        );
      } else {
        return (
          new Date(b.capsuleId.dateISO[0]).getTime() -
          new Date(a.capsuleId.dateISO[0]).getTime()
        );
      }
    });
  }
  if (sortBy === "like") {
    likes = likes.sort((a, b) => {
      if (sortOrder === "asc") {
        return (
          new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        );
      } else {
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      }
    });
  }
  return likes;
}
