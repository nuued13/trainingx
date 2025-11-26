export function LoadingState() {
  return (
    <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 min-h-full flex items-center justify-center">
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-emerald-100">Loading practice zone...</p>
      </div>
    </div>
  );
}
