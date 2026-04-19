import React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      {/* Background Grid Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]"
           style={{ backgroundImage:`linear-gradient(var(--border) 1px,transparent 1px),
                                     linear-gradient(90deg,var(--border) 1px,transparent 1px)`,
                    backgroundSize:'40px 40px' }}/>
                    
      <div className="w-full max-w-sm relative z-10 animate-fade-in">
        {children}
      </div>
    </div>
  );
}
