import RecentLikeList from "../components/RecentLikeList";
import KeywordSubscription from "../components/KeywordSubscription";
export default async function Page({
  params: { lng },
  searchParams,
}: {
  params: { lng: string };
  searchParams: Record<string, string>;
}) {
  return (
    <main className="w-full space-y-5">
      <RecentLikeList lng={lng} searchParams={searchParams} />
      <div className="p-2"></div>
      {/* <KeywordSubscription lng={lng}/> */}
    </main>
  );
}
