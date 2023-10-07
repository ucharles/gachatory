import Link from "next/link";
import Image from "next/image";
import bigLogo from "../../../../public/images/pnglogo.png";
import smallLogo from "../../../../public/images/small_logo.png";
import SearchBar from "./SearchBar";

export default function Navbar({ lng }: { lng: string }) {
  // flex와 w-full을 동시에 사용하면, 부모의 width만큼 너비가 늘어나지 않으니 주의
  return (
    <nav className="sticky top-0 z-40 bg-background-white/95 pt-2 sm:pt-6 md:pt-6 lg:pt-6 xl:pt-6 fold:pt-6">
      <div className="container flex w-[1200px] flex-row items-center justify-items-center space-x-4">
        <div className="flex basis-2/12 sm:justify-center fold:justify-center 3xs:justify-center 2xs:justify-center xs:justify-center">
          <Link href={`/${lng}`}>
            <Image
              priority
              src={bigLogo}
              alt="logo"
              width={200}
              height={32}
              className="h-auto w-44 pb-2 sm:hidden fold:hidden 3xs:hidden 2xs:hidden xs:hidden"
            />
            <Image
              priority
              src={smallLogo}
              alt="logo"
              width={50}
              height={40}
              className="h-auto w-10 md:hidden lg:hidden xl:hidden"
            />
          </Link>
        </div>
        <div className="basis-9/12">
          <SearchBar lng={lng} />
        </div>
        <div className="flex basis-1/12 justify-end space-x-3">
          <button>
            <svg
              id="프로필_아이콘"
              data-name="프로필 아이콘"
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
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
          </button>
        </div>
      </div>
      <div className="mt-2 h-[1px] border border-gray-100 sm:mt-6 md:mt-6 lg:mt-6 xl:mt-6 fold:mt-6"></div>
    </nav>
  );
}
