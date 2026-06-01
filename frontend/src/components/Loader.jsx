import React from 'react';

const Loader = ({ fullPage = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-zinc-800"></div>
        <div className="absolute inset-0 rounded-full border-4 border-brand-500 border-t-transparent animate-spin"></div>
      </div>
      <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 font-outfit tracking-wide animate-pulse">
        Loading Cyvanta LMS...
      </p>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50/80 dark:bg-zinc-950/80 backdrop-blur-md">
        {content}
      </div>
    );
  }

  return (
    <div className="w-full py-12 flex items-center justify-center">
      {content}
    </div>
  );
};

export default Loader;
