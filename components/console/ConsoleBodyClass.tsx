"use client";
import { useEffect } from "react";

export default function ConsoleBodyClass() {
  useEffect(() => {
    const original = document.body.getAttribute("data-shell");
    document.body.setAttribute("data-shell", "console");
    return () => {
      if (original === null) document.body.removeAttribute("data-shell");
      else document.body.setAttribute("data-shell", original);
    };
  }, []);
  return null;
}
