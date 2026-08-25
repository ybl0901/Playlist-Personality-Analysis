import type { Plugin } from "vite";

/**
 * Sites vite plugin (minimal no-op version for local dev).
 * The original plugin handled multi-site preview routing; for this MVP
 * a single site is sufficient.
 */
export function sites(): Plugin {
  return {
    name: "sites",
    enforce: "pre",
  };
}
