import * as React from "react";

interface LinkProps {
  active: boolean;
  children: Element;
  onClick();
}

export default ({ active, children, onClick }: LinkProps) => {
  if (active) {
    return <span>{children}</span>;
  }

  return (
    <a
      href="#"
      onClick={e => {
        e.preventDefault();
        onClick();
      }}
    >
      {children}
    </a>
  );
};
