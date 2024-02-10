export default function LikedCapsuleSkeleton({
  isFirst = false,
}: {
  isFirst?: boolean;
}) {
  const items = Array.from({ length: 10 });

  return (
    <ul
      className={`grid grid-cols-1 gap-x-10 gap-y-10 md:grid-cols-2 ${
        isFirst ? null : "mt-10"
      }`}
    >
      {items.map((_, index) => (
        <li key={index} className="animate-pulse">
          <div className="flex h-28 justify-between space-x-6">
            <div className="flex basis-1/3 rounded-lg bg-bg-footer"></div>
            <div className="flex basis-2/3 rounded-lg bg-bg-footer"></div>
          </div>
        </li>
      ))}
    </ul>
  );
}
