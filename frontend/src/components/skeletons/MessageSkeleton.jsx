const MessageSkeleton = () => {
  const skeletonMessages = Array(6).fill(null);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      {skeletonMessages.map((_, idx) => (
        <div key={idx} className={`flex ${idx % 2 === 0 ? "justify-start" : "justify-end"}`}>
          <div className="flex items-end gap-2">
            <div className="skeleton w-8 h-8 rounded-full" />
            <div className="skeleton h-5 w-40 sm:w-64 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageSkeleton;
