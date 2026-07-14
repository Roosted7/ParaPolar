import { useEffect, useState } from "react";
import * as storage from "../lib/storage";

/**
 * Dark-mode state. The inline script in index.html applies the saved theme to
 * <html> before React mounts (to avoid a flash); this hook adopts that value
 * and keeps <html>, localStorage and the theme-color meta tag in sync.
 */
export function useTheme() {
  const [dark, setDark] = useState(() => {
    try {
      return document.documentElement.classList.contains("dark");
    } catch {
      return false;
    }
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    storage.setItem("pp_dark", dark ? "true" : "false");
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", dark ? "#0f172a" : "#f8fafc");
  }, [dark]);

  return [dark, setDark];
}
