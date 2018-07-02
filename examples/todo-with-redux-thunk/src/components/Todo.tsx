import * as React from "react";
import "./Todo.less";

interface TodoProps {
  text: string;
  completed: boolean;
  onClick();
}

export default ({ onClick, completed, text }: TodoProps) => (
  <li
    className="todo"
    onClick={onClick}
    style={{
      textDecoration: completed ? "line-through" : "none"
    }}
  >
    {text}
  </li>
);
