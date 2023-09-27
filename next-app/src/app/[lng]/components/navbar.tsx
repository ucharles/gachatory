import Link from "next/link";
import Image from "next/image";
import bigLogo from "../../../../public/images/pnglogo.png";
import smallLogo from "../../../../public/images/small_logo.png";
import SearchBar from "./SearchBar";

export default function Navbar({ lng }: { lng: string }) {
  return (
    <nav className="h-20">
      <div className="h-16 flex justify-between items-center p-4 pt-10">
        <div className="pr-6">
          <Link href={`/${lng}`}>
            <Image
              priority
              src={bigLogo}
              alt="logo"
              width={200}
              height={40}
              className="w-52 h-auto fold:hidden 3xs:hidden 2xs:hidden"
            />
            <Image
              src={smallLogo}
              alt="logo"
              width={50}
              height={40}
              className="w-11 h-auto xl:hidden lg:hidden md:hidden sm:hidden xs:hidden"
            />
          </Link>
        </div>
        <SearchBar lng={lng} />
      </div>
    </nav>
  );
}
