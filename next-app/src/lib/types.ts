export type Language = "ja" | "en" | "ko";

export interface Notification {
  notificationId: string;
  tags: Tag[];
  createdAt: string;
  confirmed: boolean;
}

interface Tag {
  tagId: string;
  tagName: Localization<string[]>;
  capsules: Capsule[];
}

interface Capsule {
  capsuleId: string;
  capsuleName: Localization<string>;
  brandName: Localization<string>;
  releaseDate: string;
  detailUrl: string;
  img: string;
}

interface Localization<T extends string | string[]> {
  ja: T;
  en: T;
  ko: T;
}
