// src/components/ScrollToTop.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Whenever the route pathname changes, scroll to the top left of the window instantly
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
