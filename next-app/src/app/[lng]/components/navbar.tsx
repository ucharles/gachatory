import Link from "next/link";

export default function Navbar({ lng }: { lng: string }) {
  return (
    <nav className="flexBetween navbar">
      <Link href={`/${lng}`}>Home</Link>
      <Link href={`/${lng}/search`}>Search</Link>
    </nav>
  );
}
