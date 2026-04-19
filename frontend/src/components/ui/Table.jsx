import React from 'react';

export function Table({ className = '', children }) {
  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <table className="w-full text-left border-collapse">
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ className = '', children }) {
  return (
    <thead className={`border-b border-background-border bg-background ${className}`}>
      {children}
    </thead>
  );
}

export function TableRow({ className = '', hover = true, children, ...props }) {
  return (
    <tr 
      className={`
        border-b border-background-border last:border-0 transition-colors duration-150
        ${hover ? 'hover:bg-background-hover' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHead({ className = '', children }) {
  return (
    <th className={`h-9 px-4 text-[11px] font-medium text-text-muted uppercase tracking-wider align-middle ${className}`}>
      {children}
    </th>
  );
}

export function TableCell({ className = '', children }) {
  return (
    <td className={`h-9 px-4 text-[13px] text-text-primary align-middle whitespace-nowrap ${className}`}>
      {children}
    </td>
  );
}
