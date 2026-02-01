import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function ScrollToTop({ offset = 0 }) {
  const { pathname } = useLocation();

  useEffect(() => {
    // Smooth scroll to top whenever route changes
    window.scrollTo({
      top: offset,
      behavior: "smooth",
    });
  }, [pathname, offset]);

  return null;
}

export default ScrollToTop;
