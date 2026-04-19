// frontend/src/components/ui/SkeletonLoader.jsx
// Sentinel — Skeleton loading placeholders with shimmer animation

/**
 * Single line skeleton placeholder.
 * @param {string} width  - CSS width value (default: '100%')
 * @param {string} height - CSS height value (default: '12px')
 */
export function SkeletonLine({ width = '100%', height = '12px', className = '' }) {
  return (
    <div
      className={`skeleton-shimmer rounded ${className}`}
      style={{ width, height }}
    />
  );
}

/**
 * Skeleton card placeholder — simulates a stat card or content card.
 */
export function SkeletonCard({ className = '' }) {
  return (
    <div className={`card p-4 space-y-3 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="skeleton-shimmer w-9 h-9 rounded-md shrink-0" />
        <div className="flex-1 space-y-2">
          <SkeletonLine width="60%" height="18px" />
          <SkeletonLine width="40%" height="10px" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton table rows placeholder.
 * @param {number} rows - Number of rows to render (default: 5)
 * @param {number} cols - Number of columns per row (default: 5)
 */
export function SkeletonTable({ rows = 5, cols = 5, className = '' }) {
  return (
    <div className={`card overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-[#21262d]">
        {Array.from({ length: cols }).map((_, i) => (
          <SkeletonLine key={i} width={i === 0 ? '40px' : '80px'} height="10px" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={rowIdx}
          className="flex items-center gap-4 px-4 py-3 border-b border-[#21262d]/50"
        >
          {Array.from({ length: cols }).map((_, colIdx) => (
            <SkeletonLine
              key={colIdx}
              width={colIdx === 0 ? '30px' : `${50 + Math.random() * 60}px`}
              height="10px"
            />
          ))}
        </div>
      ))}
    </div>
  );
}
