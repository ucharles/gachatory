import { ICapsuleToy } from "@/lib/models/capsule-model";
import Image from "next/image";
import ImageGallery from "../../components/image-gallery";
import Link from "next/link";
import { cacheTimeEnum } from "@/lib/enums";

const IMAGE_URI = process.env.IMAGE_SERVER_URL || "";
const API_URI = process.env.APP_SERVER_URL || "";

async function fetchData(id: string) {
  const response = await fetch(API_URI + "/api/capsules/" + id, {
    method: "GET",
    next: { revalidate: cacheTimeEnum.FIVE_MINUTES },
  });
  const data = await response.json();
  return data;
}

export default async function Page({ params }: { params: { id: string } }) {
  const capsule: ICapsuleToy = await fetchData(params.id);

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
        <p className="text-body-medium pb-5">{capsule.description}</p>
        <p className="text-body-medium pb-5">
          <Link href={capsule.detail_url} as={capsule.detail_url}>
            Site Link
          </Link>
        </p>
      </div>
    </div>
  );
}
