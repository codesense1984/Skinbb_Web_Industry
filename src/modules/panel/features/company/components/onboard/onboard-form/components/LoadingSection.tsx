export const LoadingSection = () => {
  return (
    <div className="space-y-6 bg-white">
      <div className="flex animate-pulse flex-col gap-6 lg:grid lg:grid-cols-2">
        <div className="h-10 rounded bg-gray-200"></div>
        <div className="h-10 rounded bg-gray-200"></div>
      </div>

      <div className="flex animate-pulse flex-col gap-6 lg:grid lg:grid-cols-2">
        <div className="h-10 rounded bg-gray-200"></div>
        <div className="h-10 rounded bg-gray-200"></div>
      </div>

      <div className="flex animate-pulse flex-col gap-6 lg:grid lg:grid-cols-2">
        <div className="h-10 rounded bg-gray-200"></div>
        <div className="h-10 rounded bg-gray-200"></div>
      </div>

      <div className="animate-pulse">
        <div className="h-20 rounded bg-gray-200"></div>
      </div>
    </div>
  );
};
