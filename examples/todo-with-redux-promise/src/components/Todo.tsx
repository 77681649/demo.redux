import * as React from "react";

interface TodoProps {
  text: string;
  completed: boolean;
  onClick();
}

export default ({ onClick, completed, text }: TodoProps) => (
  <li
    onClick={onClick}
    style={{
      textDecoration: completed ? "line-through" : "none"
    }}
  >
    {text}
  </li>
);
