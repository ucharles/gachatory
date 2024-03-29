import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import bigLogo from "public/images/pnglogo.png";
import smallLogo from "public/images/small_logo.png";
import SearchBar from "@/components/navbar/SearchBar";
import Avatar from "./Avatar";
import UserInfoOverlay from "./UserInfoOverlay";

import { getServerSession } from "next-auth/next";
import { options } from "@/app/api/auth/[...nextauth]/options";

import getQueryClient from "../Providers/getQueryClient";
import { dehydrate } from "@tanstack/react-query";
import Hydrate from "../Providers/HydrateClient";
import { getNotificationCount } from "@/lib/fetch-data";

export default async function Navbar({ lng }: { lng: string }) {
  const session = await getServerSession(options);
  const queryClient = getQueryClient();
  const cookie = cookies();
  await queryClient.prefetchQuery({
    queryKey: ["notificationCount"],
    queryFn: () => getNotificationCount(cookie),
  });

  function profileImage() {
    if (session) {
      if (session.user?.name) {
        return <Avatar name={session.user.name} />;
      } else {
        return (
          <svg
            id="프로필_아이콘"
            data-name="프로필 아이콘"
            xmlns="http://www.w3.org/2000/svg"
            width="35"
            height="35"
            viewBox="0 0 40 40"
          >
            <g id="그룹_31" data-name="그룹 31">
              <rect
                id="사각형_5"
                data-name="사각형 5"
                width="40"
                height="40"
                fill="none"
              />
            </g>
            <g id="그룹_32" data-name="그룹 32" transform="translate(2 2)">
              <path
                id="패스_18"
                data-name="패스 18"
                d="M20,2A18,18,0,1,0,38,20,18.007,18.007,0,0,0,20,2Zm0,7.2a6.3,6.3,0,1,1-6.3,6.3A6.307,6.307,0,0,1,20,9.2Zm0,25.2A14.415,14.415,0,0,1,8.948,29.216a17.913,17.913,0,0,1,22.1,0A14.415,14.415,0,0,1,20,34.4Z"
                transform="translate(-2 -2)"
                fill="#707070"
              />
            </g>
          </svg>
        );
      }
    } else {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="30"
          viewBox="0 -960 960 960"
          width="30"
          fill="#707070"
        >
          <path d="M480-120v-80h280v-560H480v-80h280q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H480Zm-80-160-55-58 102-102H120v-80h327L345-622l55-58 200 200-200 200Z" />
        </svg>
      );
    }
  }

  // flex와 w-full을 동시에 사용하면, 부모의 width만큼 너비가 늘어나지 않으니 주의
  return (
    <nav className="sticky top-0 z-40 bg-background-white/95">
      <div className="container relative flex max-w-[1200px] flex-row items-center justify-items-center space-x-4 px-6 py-3 md:py-6 xl:px-0">
        <div className="flex basis-2/12 justify-center">
          <Link href={`/${lng}`}>
            <div className="hidden px-1 pb-2 md:block">
              <Image
                priority
                src={bigLogo}
                alt="logo"
                width={150}
                height={0}
                style={{ width: "auto", height: "auto" }}
              />
            </div>
            <div className="mb-1 md:hidden">
              <Image
                priority
                src={smallLogo}
                alt="logo"
                width={80}
                height={0}
                style={{ width: "40px", height: "auto" }}
              />
            </div>
          </Link>
        </div>
        <div className="basis-9/12">
          <SearchBar lng={lng} />
        </div>
        <div className="flex basis-1/12 justify-end space-x-3">
          {session ? (
            <Hydrate state={dehydrate(queryClient)}>
              <UserInfoOverlay lng={lng}>{profileImage()}</UserInfoOverlay>
            </Hydrate>
          ) : (
            <Link href="/auth/signin">
              <button className="flex items-center">{profileImage()}</button>
            </Link>
          )}
        </div>
      </div>

      <div className="h-[1px] border border-gray-100"></div>
    </nav>
  );
}
