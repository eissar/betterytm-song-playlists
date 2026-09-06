/* 
 * This file contains an express HTTP server that is used for serving the plugin files during local development.
 * Learn more about express here: https://expressjs.com/
 * 
 * Arguments:
 * --port=1234         // Specify the port on which the server should run - falls back to the env var DEV_SERVER_PORT or the default port in vite.config.ts
 * --auto-exit-time=10 // Automatically exit the server after a given amount of seconds - enables request logging if provided
 */

import { join } from "node:path";
import { fileURLToPath } from "node:url";
import express, { NextFunction, Request, Response } from "express";
import "dotenv/config";
import { defaultPort } from "../../vite.config.js";
import packageJson from "../../package.json" with { type: "json" };

/**
 * Path to the directory where the output files are located.  
 * Starts from project root, can't start with a slash, but can optionally have a trailing slash.
 */
const outputDir = "dist";
/** Whether to log requests to the console. */
const enableLogging = process.env.DEV_SERVER_LOG_REQUESTS?.trim().toLowerCase() === "true";
/**
 * Paths to all folders that should be served by the dev server - paths are relative to this file.  
 * If an item is an array, all of its parts will be joined using `import("node:path").join()`
 */
const staticPaths = [
  "/",
  "/assets/",
  ["/", outputDir],
];


const cliPortRaw = Number(process.argv.find(arg => arg.startsWith("--port="))?.split("=")[1]);
const envPortRaw = Number(process.env.DEV_SERVER_PORT);
/** HTTP port of the dev server */
const devServerPort = !isNaN(cliPortRaw)
  ? cliPortRaw
  : (
    !isNaN(envPortRaw)
      ? envPortRaw
      : defaultPort
  );

const autoExitRaw = process.argv.find(arg => arg.startsWith("--auto-exit-time="))?.split("=")[1];
/** Time in milliseconds after which the process should automatically exit */
const autoExitTime: number | undefined = !isNaN(Number(autoExitRaw)) ? Number(autoExitRaw) * 1000 : undefined;


const app = express();

// log requests:
if(enableLogging || autoExitTime) {
  app.use((_req, _res, next) => {
    process.stdout.write("*");
    next();
  });
}

// handle errors:
app.use((err: unknown, _req: Request, _res: Response, _next: NextFunction) => {
  if(typeof err === "string" || err instanceof Error)
    console.error("\x1b[31mError in dev server:\x1b[0m\n", err);
});

// serve folder contents:
for(const path of staticPaths) {
  app.use("/", express.static(
    join(fileURLToPath(import.meta.url), "../../../", ...(!Array.isArray(path) ? [path] : path))
  ));
}

// create server:
const server = app.listen(devServerPort, "0.0.0.0", () => {
  console.log(`\nDev server is running on port ${devServerPort}`);
  console.log(`\x1b[34m\x1b[4mhttp://localhost:${devServerPort}/${encodeURIComponent(getScriptFileName())}.user.js\x1b[0m`);
  if(enableLogging)
    process.stdout.write("\nRequests: ");
  else
    console.log("\x1b[2m(request logging is disabled)\x1b[0m");
  console.log();

  if(autoExitTime) {
    console.log(`Exiting in ${autoExitTime / 1000}s...`);
    setTimeout(() => {
      server.close(() => setImmediate(() => process.exit(0)));
    }, autoExitTime);
  }
});

/** Returns the userscript file name, which is `userscriptName` in package.json, modified to match that of `vite-plugin-monkey` */
function getScriptFileName(): string {
  return packageJson.userscriptName.toLowerCase().replace(/ /g, "-");
}
