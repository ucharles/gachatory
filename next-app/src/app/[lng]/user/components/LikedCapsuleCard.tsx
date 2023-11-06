import Link from "next/link";
import Image from "next/image";
import { DisplayCapsuleOneTag } from "../../components/display-capsule-tag";
import { ICapsuleTag } from "@/lib/models/capsule-tag-model";

interface LikedCapsuleCardProps {
  id: string;
  name: string;
  date: string[];
  img: string;
  lng: string;
  tags: ICapsuleTag[];
}
export default function LikedCapsuleCard({
  id,
  name,
  date,
  img,
  lng,
  tags,
}: LikedCapsuleCardProps) {
  return (
    <li key={id}>
      <div className="flex aspect-square items-center justify-center overflow-hidden rounded-md bg-gray-100">
        <Link href={`/${lng}/capsule/${id}`}>
          <Image
            src={img}
            alt={name}
            width={400}
            height={400}
            className="scale-125 object-center transition duration-300 hover:translate-y-0 hover:scale-100 hover:opacity-90"
          />
        </Link>
      </div>
      <div>
        <div className="pb-2 pt-2">
          <Link href={`/${lng}/capsule/${id}`}>
            <p className="inline-block text-subtle-medium text-gray-600">
              {date[0]}
            </p>
            <h1 className="max-lines-3 break-words text-body-bold text-gray-800 3xs:text-base-semibold">
              {name}
            </h1>
          </Link>
        </div>
        <div className="flex flex-row justify-between">
          <div className="">
            <DisplayCapsuleOneTag tags={tags} lng={lng} />
          </div>
        </div>
      </div>
    </li>
  );
}
