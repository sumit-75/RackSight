import LineLoader from '@/components/LineLoader';

export default function RootLoading() {
  return (
    <div className="space-y-8 animate-pulse w-full">
      {/* Top Line Loader */}
      <LineLoader />

      {/* Header Skeleton */}
      <div className="space-y-2.5">
        <div className="h-8 bg-slate-200/40 rounded-lg w-1/4"></div>
        <div className="h-4 bg-slate-200/20 rounded w-1/2"></div>
      </div>

      {/* Metrics Cards Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-5 flex items-center justify-between shadow-sm h-24">
            <div className="space-y-2 flex-1">
              <div className="h-3 bg-slate-200/20 rounded w-1/2"></div>
              <div className="h-6 bg-slate-200/40 rounded w-1/3"></div>
            </div>
            <div className="p-3 bg-slate-100 rounded-lg h-10 w-10"></div>
          </div>
        ))}
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left List Area (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="h-6 bg-slate-200/30 rounded w-1/5"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-white p-5 h-44 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="h-4 bg-slate-200/40 rounded w-1/2"></div>
                    <div className="h-5 bg-slate-200/20 rounded w-6"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-slate-200/20 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-200/20 rounded w-2/3"></div>
                  </div>
                </div>
                <div className="h-4 bg-slate-200/30 rounded w-1/3 self-end"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Form Sidebar (1 col) */}
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-md h-80 space-y-6">
            <div className="h-5 bg-slate-200/40 rounded w-1/2"></div>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="h-3 bg-slate-200/25 rounded w-1/4"></div>
                <div className="h-10 bg-slate-200/20 rounded-lg"></div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-slate-200/25 rounded w-1/3"></div>
                <div className="h-10 bg-slate-200/20 rounded-lg"></div>
              </div>
            </div>
            <div className="h-10 bg-slate-200/40 rounded-lg mt-6"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
