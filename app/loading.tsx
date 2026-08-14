import LineLoader from '@/components/LineLoader';

export default function RootLoading() {
  return (
    <div className="space-y-8 animate-pulse w-full font-sans">
      {/* Top Line Loader */}
      <LineLoader />

      {/* Header Skeleton */}
      <div className="space-y-2.5">
        <div className="h-8 bg-[#24231f] rounded-lg w-1/4"></div>
        <div className="h-4 bg-[#1b1915] rounded w-1/2"></div>
      </div>

      {/* Metrics Cards Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-[#24231f] bg-[#161512] p-5 flex items-center justify-between shadow-md h-24">
            <div className="space-y-2 flex-1">
              <div className="h-3 bg-[#1b1915] rounded w-1/2"></div>
              <div className="h-6 bg-[#24231f] rounded w-1/3"></div>
            </div>
            <div className="p-3 bg-[#1b1915] rounded-xl h-10 w-10 border border-[#282620]"></div>
          </div>
        ))}
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left List Area (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="h-6 bg-[#24231f] rounded w-1/5"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-[#24231f] bg-[#161512] p-5 h-44 flex flex-col justify-between shadow-md">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="h-4 bg-[#24231f] rounded w-1/2"></div>
                    <div className="h-5 bg-[#1b1915] rounded w-6"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-[#1b1915] rounded w-3/4"></div>
                    <div className="h-3 bg-[#1b1915] rounded w-2/3"></div>
                  </div>
                </div>
                <div className="h-4 bg-[#24231f] rounded w-1/3 self-end"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Form Sidebar (1 col) */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-[#24231f] bg-[#161512] p-6 shadow-md h-80 space-y-6">
            <div className="h-5 bg-[#24231f] rounded w-1/2"></div>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="h-3 bg-[#1b1915] rounded w-1/4"></div>
                <div className="h-10 bg-[#1b1915] rounded-xl border border-[#282620]"></div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-[#1b1915] rounded w-1/3"></div>
                <div className="h-10 bg-[#1b1915] rounded-xl border border-[#282620]"></div>
              </div>
            </div>
            <div className="h-10 bg-[#24231f] rounded-xl mt-6"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
