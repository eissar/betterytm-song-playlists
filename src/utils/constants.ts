const buildModeRaw = "#{{BUILD_MODE}}";     // Each build these will be replaced by
const buildNumberRaw = "#{{BUILD_NUMBER}}"; // the custom vite plugin in vite.config.ts

/** The build mode (development, production, etc.) */
export const buildMode = (buildModeRaw.startsWith("#{{") ? "BUILD_ERROR" : buildModeRaw) as string;

/** The build number (last Git commit's shortened hash) of the current build */
export const buildNumber = (buildNumberRaw.startsWith("#{{") ? "BUILD_ERROR" : buildNumberRaw) as string;
