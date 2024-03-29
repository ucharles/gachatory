"use client";

import { useState, useEffect, useRef } from "react";

import Link from "next/link";
import Image from "next/image";
import bigLogo from "public/images/pnglogo.png";
import smallLogo from "public/images/small_logo.png";
import SearchBar from "../../../components/navbar/SearchBar";
import { useSession } from "next-auth/react";
import Avatar from "../../../components/navbar/Avatar";
import UserInfoOverlay from "../../../components/navbar/UserInfoOverlay";

export default function Navbar({ lng }: { lng: string }) {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const { data: session } = useSession({
    required: false,
    onUnauthenticated() {},
  });

  const overlayRef = useRef(null);

  useEffect(() => {
    function handleDocumentClick(event: MouseEvent) {
      if (
        overlayRef.current &&
        !(overlayRef.current as HTMLElement).contains(event.target as Node)
      ) {
        setIsOverlayOpen(false);
      }
    }

    document.addEventListener("click", handleDocumentClick);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

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
            <div className="hidden pb-2 md:block">
              <Image
                priority
                src={bigLogo}
                alt="logo"
                width={200}
                height={0}
                style={{ width: "200px", height: "auto" }}
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
            <button
              className="flex items-center"
              onClick={() => setIsOverlayOpen(!isOverlayOpen)}
              ref={overlayRef}
            >
              {profileImage()}
            </button>
          ) : (
            <Link href="/auth/signin">
              <button className="flex items-center">{profileImage()}</button>
            </Link>
          )}
        </div>
        {session ? (
          <div
            className={`${
              isOverlayOpen ? "block" : "hidden"
            } absolute right-3 top-full mt-4`}
          >
            <UserInfoOverlay lng={lng} />
          </div>
        ) : null}
      </div>

      <div className="h-[1px] border border-gray-100"></div>
    </nav>
  );
}
