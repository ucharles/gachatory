import { ICapsuleToy } from "@/lib/models/capsule-model";
import Image from "next/image";
import ImageGallery from "../../components/image-gallery";
import DisplayCapsuleTags from "../../components/display-capsule-tag";
import Link from "next/link";
import { cacheTimeEnum } from "@/lib/enums";
import { translate } from "@/app/i18n";

const IMAGE_URI = process.env.IMAGE_SERVER_URL || "";
const API_URI = process.env.APP_SERVER_URL || "";

async function fetchData(id: string, lng: string) {
  const response = await fetch(API_URI + `/api/capsules/${id}?lng=${lng}`, {
    next: { revalidate: cacheTimeEnum.FIVE_MINUTES },
  });
  const data = await response.json();
  return data;
}

export default async function Page({
  params: { lng, id },
}: {
  params: { lng: string; id: string };
}) {
  const capsule: ICapsuleToy = await fetchData(id, lng);
  const { t } = await translate(lng);

  const main_image = capsule.img
    ? IMAGE_URI + capsule.img
    : IMAGE_URI + "images/prepare.jpg";

  let detail_images: string[] = [];

  if (capsule.detail_img.length !== 0) {
    capsule.detail_img.map((img: string) => {
      detail_images.push(IMAGE_URI + img);
    });
  }

  return (
    <div className="grid grid-cols-2">
      <div className="p-5">
        <div className="flex justify-center border border-black ">
          <Image
            src={main_image}
            alt={capsule.name}
            width={560}
            height={560}
            unoptimized={true}
          />
        </div>
        <ImageGallery detail_img={detail_images} />
      </div>
      <div className="p-5">
        <h1 className="text-heading2-bold pb-5">{capsule.name}</h1>
        {capsule.originalName ? (
          <p className="text-body-medium pb-5 text-gray-500">
            {capsule.originalName}
          </p>
        ) : null}
        <p className="text-body-medium pb-5">
          {t("price")}: {capsule.price}
          {t("yen")}
        </p>
        <p className="text-body-medium pb-5">
          {t("release-date")}: {capsule.date}
        </p>
        <p className="text-body-medium pb-5">{capsule.description}</p>
        {capsule.tagId.length !== 0 ? (
          <div className="pb-3">
            <DisplayCapsuleTags tags={capsule.tagId} lng={lng} />
          </div>
        ) : null}
        <p className="text-body-small pb-5 underline text-gray-500">
          <Link href={capsule.detail_url} as={capsule.detail_url}>
            {t("site-link")}
          </Link>
        </p>
      </div>
    </div>
  );
}
