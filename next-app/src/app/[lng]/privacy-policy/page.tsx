import PrivacyPolicyKR from "./components/PrivacyPolicyKR";

export default function Page({ params: { lng } }: { params: { lng: string } }) {
  return <div className="mt-10">{lng === "ko" && <PrivacyPolicyKR />}</div>;
}
