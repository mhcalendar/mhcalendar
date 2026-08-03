import type { ReactNode } from 'react';

export function Steps({ children }: { children: ReactNode }): ReactNode {
  return <div className="mh-steps">{children}</div>;
}

export function Step({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: ReactNode;
}): ReactNode {
  return (
    <div className="mh-step">
      <span className="mh-step-marker">{number}</span>
      <div className="mh-step-content">
        <h3>{title}</h3>
        {children}
      </div>
    </div>
  );
}
