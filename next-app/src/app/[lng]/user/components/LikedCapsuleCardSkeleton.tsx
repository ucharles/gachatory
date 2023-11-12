function LikedCapsuleCardSkeleton() {
  const items = Array.from({ length: 4 });
  return (
    <>
      {items.map((_, index) => (
        <li key={index} className="animate-pulse">
          <div className="mb-4 flex aspect-square items-center justify-center overflow-hidden rounded-md bg-gray-100"></div>
          <div className="w-full rounded-md bg-gray-100 py-16"></div>
        </li>
      ))}
    </>
  );
}

export default LikedCapsuleCardSkeleton;
