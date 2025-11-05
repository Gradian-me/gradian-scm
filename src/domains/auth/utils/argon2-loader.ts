// Argon2 Loader
// Server-only module loader for argon2 to avoid bundling issues

import "server-only";

// Cache for the loaded module
let argon2Cache: any = null;

/**
 * Load argon2 module at runtime
 * Since argon2 is marked as serverExternalPackages in next.config.ts,
 * we can use a direct require here - it won't be bundled by Turbopack
 */
export function loadArgon2() {
  if (typeof window !== "undefined") {
    throw new Error("Argon2 can only be used on the server side");
  }
  
  if (argon2Cache) {
    return argon2Cache;
  }
  
  // Direct require - serverExternalPackages ensures this is not bundled
  // Using a string literal here is safe because it's marked as external
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
  argon2Cache = require("argon2");
  
  return argon2Cache;
}

