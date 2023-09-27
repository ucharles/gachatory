import Link from "next/link";
import Image from "next/image";
import pngLogo from "../../../../public/images/pnglogo.png";

export default function Navbar({ lng }: { lng: string }) {
  return (
    <nav className="h-20">
      <div className="h-16 flex justify-between items-center p-6">
        <Link href={`/${lng}`}>
          <Image priority src={pngLogo} alt="logo" width={200} height={40} />
        </Link>
        <Link href={`/${lng}/search`}>Search</Link>
      </div>
      <div className="h-[1px] bg-black"></div>
    </nav>
  );
}
