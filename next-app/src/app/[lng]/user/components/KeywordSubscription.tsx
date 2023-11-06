export default function KeywordSubscription() {
  return (
    <div className="relative">
      <div className="absolute z-10 h-full w-full rounded-xl bg-slate-300 bg-opacity-50">
        <p className="mt-10 text-center font-YgJalnan text-4xl text-gray-800">
          준비중
        </p>
      </div>
      <div className="space-y-7 p-5 opacity-80">
        <article className="space-y-4">
          <div className="space-y-3">
            <h1 className="text-heading2.5-bold">키워드 알림 설정</h1>
            <p className="text-small-medium text-gray-500">
              키워드를 설정하시면, 새 캡슐 토이가 등록되었을 때 메일을
              보내드려요!
            </p>
          </div>
          <div className="h-14 rounded-lg bg-bg-footer p-4">
            검색어를 입력하세요
          </div>
          <div className="h-36 rounded-lg bg-bg-footer p-4">
            검색어를 입력하세요
          </div>
        </article>
        <article className="space-y-4">
          <div className="space-y-3">
            <h1 className="text-heading2.5-bold">내가 등록한 키워드</h1>
            <p className="text-small-medium text-gray-500">
              키워드는 최대 10개까지 구독할 수 있습니다.
            </p>
          </div>
          <div className="h-14 rounded-lg bg-bg-footer p-4">
            검색어를 입력하세요
          </div>
        </article>
      </div>
    </div>
  );
}
