import packageJson from "@root/package.json" with { type: "json" };

/** Common prefix to be able to tell logged messages apart and filter them in devtools */
const consPrefix = `[${packageJson.userscriptName}]`;
const consPrefixDbg = `[${packageJson.userscriptName}/#DEBUG]`;

/** Logs all passed values to the console */
export function log(...args: unknown[]): void {
  console.log(consPrefix, ...args);
}

/** Logs all passed values to the console as info */
export function info(...args: unknown[]): void {
  console.info(consPrefix, ...args);
}

/** Logs all passed values to the console as a warning */
export function warn(...args: unknown[]): void {
  console.warn(consPrefix, ...args);
}

/** Logs all passed values to the console as an error */
export function error(...args: unknown[]): void {
  console.error(consPrefix, ...args);
}

/** Logs all passed values to the console with a debug-specific prefix */
export function dbg(...args: unknown[]): void {
  console.log(consPrefixDbg, ...args);
}
