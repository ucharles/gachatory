function CapsuleCardSkeleton({ isFirst }: { isFirst?: boolean }) {
  const items = Array.from({ length: 20 });
  return (
    <ul
      className={`grid gap-x-6 gap-y-10 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 fold:grid-cols-2 3xs:grid-cols-2 2xs:grid-cols-2 xs:grid-cols-2 ${
        isFirst ? null : "pt-10"
      }`}
    >
      {items.map((_, index) => (
        <li key={index} className="animate-pulse">
          <div className="mb-4 flex aspect-square items-center justify-center overflow-hidden rounded-md bg-gray-100"></div>
          <div className="w-full rounded-md bg-gray-100 py-14"></div>
        </li>
      ))}
    </ul>
  );
}

export default CapsuleCardSkeleton;
