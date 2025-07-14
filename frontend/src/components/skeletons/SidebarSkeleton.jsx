const SidebarSkeleton = () => {
  const skeletonContacts = Array(8).fill(null);

  return (
    <aside className="w-[350px] border-r border-gray-800 bg-[#1e1e1e] flex flex-col">
      <div className="p-4 flex items-center gap-3 border-b border-gray-800">
        <div className="skeleton w-5 h-5 rounded" />
        <div className="skeleton h-8 w-full rounded-full" />
      </div>

      <div className="flex-1 overflow-y-auto">
        {skeletonContacts.map((_, idx) => (
          <div
            key={idx}
            className="p-4 border-b border-gray-800 flex justify-between items-center gap-2"
          >
            <div className="flex items-center gap-3 w-full">
              <div className="skeleton w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-24" />
                <div className="skeleton h-3 w-36" />
              </div>
            </div>
            <div className="skeleton w-6 h-6 rounded-full" />
          </div>
        ))}
      </div>
    </aside>
  );
};

export default SidebarSkeleton;
