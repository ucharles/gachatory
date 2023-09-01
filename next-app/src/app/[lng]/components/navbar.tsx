import Link from "next/link";

export default function Navbar({ lng }: { lng: string }) {
  return (
    <nav className="h-20">
      <div className="h-16 flex justify-between items-center p-6">
        <Link href={`/${lng}`}>
          <p className="text-heading3-bold">Gachatory</p>
        </Link>
        <Link href={`/${lng}/search`}>Search</Link>
      </div>
      <div className="h-[1px] bg-black"></div>
    </nav>
  );
}
