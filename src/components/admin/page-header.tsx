import React from "react";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="sticky top-0 z-10 bg-gray-50 border-b border-gray-100 px-4 pt-5 pb-4 md:px-8 md:pt-7 md:pb-5 overflow-hidden">
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-gray-900 md:text-2xl leading-tight">{title}</h1>
          {description && (
            <p className="mt-0.5 text-sm text-gray-500 leading-snug">{description}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}

export function PageContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`px-4 py-5 pb-24 md:px-8 md:py-6 md:pb-8 ${className ?? ""}`}>
      {children}
    </div>
  );
}
