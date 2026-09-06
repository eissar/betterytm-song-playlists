import "dotenv/config";
import { execSync } from "child_process";
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { resolve } from "node:path";
import { defineConfig, normalizePath, Plugin } from "vite";
import tsConfigPathsPlugin from "vite-tsconfig-paths";
import monkeyPlugin from "vite-plugin-monkey";
import packageJson from "./package.json" with { type: "json" };
import resourcesJson from "./assets/resources.json" with { type: "json" };

//#region variables

const { author, homepage, namespace, repository, userscriptName, version } = packageJson;
const { argv, env, cwd } = process;

/**
 * Default port of the dev server.  
 * First tries to use the port specified by the "--port" argument, then the "DEV_SERVER_PORT" environment variable, and finally falls back to this value.
 */
export const defaultPort = 8767;
/**
 * Default repository (in the format "User/Repo") to use for all URLs that point to the repository.  
 * First tries to resolve the repository URL from `repository.url` in "package.json", then falls back to this value.
 */
export const defaultRepo = "Sv443/BetterYTM-Plugin-Template";


const repo = repository.url.match(/github.com\/(.+?\/.+?)\//)?.[1] ?? defaultRepo;

const cliPortRaw = Number(argv.find(arg => arg.startsWith("--port="))?.split("=")[1]);
const envPortRaw = Number(env.DEV_SERVER_PORT);
/** HTTP port of the dev server */
const devServerPort = !isNaN(cliPortRaw)
  ? cliPortRaw
  : (
    !isNaN(envPortRaw)
      ? envPortRaw
      : defaultPort
  );

//#region vite config

export default defineConfig(async ({ mode }) => {
  const buildNbr = getCommitSha();
  const resources = await getResources(mode, buildNbr);

  return {
    build: {
      minify: false,
    },
    plugins: [
      tsConfigPathsPlugin({
        root: import.meta.dirname,
      }),
      replaceStringsPlugin({
        "#{{BUILD_MODE}}": mode,
        "#{{BUILD_NUMBER}}": buildNbr,
      }),
      monkeyPlugin({
        entry: normalizePath(`${cwd()}/src/index.ts`), // see https://github.com/lisonge/vite-plugin-monkey/issues/186#issuecomment-2353496972
        userscript: {
          name: userscriptName,
          namespace,
          version,
          // necessary to make sure the plugin is registered in time and can make proper use of all API features:
          "run-at": "document-start",
          author: author.name,
          connect: [
            // for yt
            "i.ytimg.com",
            "youtube.com",
            // for fetching resources
            "github.com",
            "raw.githubusercontent.com",
            // add anything else that you may want to fetch with GM.xmlHttpRequest
          ],
          copyright: `Copyright ${new Date().getFullYear()} ${author.name}`,
          description: packageJson.description,
          homepageURL: homepage,
          supportURL: packageJson.bugs.url,
          grant: [
            "unsafeWindow", // necessary for interacting with the BYTM API
            // these are commonly used - add or remove as needed:
            // "GM.getResourceURL",
            // "GM.getResourceText",
            // "GM.setValue",
            // "GM.getValue",
            // "GM.deleteValue",
            // "GM.openInTab",
          ],
          // don't run in iframes:
          noframes: true,
          match: [
            "https://youtube.com/*",
            "https://music.youtube.com/*",
          ],
          icon: await getResourceUrl(mode, "plugin_icon_128x128.png", buildNbr),
          resource: {
            icon_1000: await getResourceUrl(mode, "plugin_icon_1000x1000.png", buildNbr),
            icon_128: await getResourceUrl(mode, "plugin_icon_128x128.png", buildNbr),
            ...resources,
          },
        },
      }),
    ],
  };
});

//#region utilities

/** Replaces strings in the bundle with other strings. */
function replaceStringsPlugin(options: Record<string, string>): Plugin {
  return {
    name: "vite-plugin-custom-replace-strings",
    transform(code, _id) {
      for(const [searchValue, replaceValue] of Object.entries(options)) {
        const regex = new RegExp(searchValue, "gm");
        code = code.replace(regex, replaceValue);
      }
      return { code };
    },
  };
}

/**
 * Returns the commit sha of the latest commit for use as a build number.  
 *   
 * ⚠️ Important: This will always trail behind the current commit by one, as the act of committing this number will also change it.  
 * If your script depends on this number (for example for versioned GitHub asset URLs), you should always commit your build separately and last.
 */
function getCommitSha(): string {
  try {
    return execSync("git rev-parse --short HEAD").toString().trim();
  }
  catch {
    console.error("\x1b[31mFailed to get the commit SHA. Is Git installed?\x1b[0m\nFalling back to 'BUILD_ERROR'.");
    return "BUILD_ERROR";
  }
}

/**
 * Parses the file at `assets/resources.json` and returns a record of all resources with their URLs.  
 * If the `integrity` property is set to true, the hash of the file will be calculated and appended to the URL for [Subresource Integrity.](https://www.tampermonkey.net/documentation.php?locale=en#api:Subresource_Integrity)
 */
async function getResources(mode: string, buildNbrOrBranch: string): Promise<Record<string, string>> {
  const resources: Record<string, string> = {};
  for(const [name, resource] of Object.entries(resourcesJson)) {
    const path = typeof resource === "string" ? resource : resource.path;
    const integrity = typeof resource === "string" || typeof resource === "object" && (!("integrity" in resource) || resource.integrity === true);
    resources[name] = await getResourceUrl(mode, path, buildNbrOrBranch, integrity);
  }
  return resources;
}

/**
 * Calculates the SHA-256 hash of the file at the given path (or http(s) URL).  
 * Uses {@linkcode resolveResourcePath()} to resolve the path, meaning paths prefixed with a slash are relative to the repository root, otherwise they are relative to the `assets` directory.
 */
function calculateHash(path: string) {
  if(path.startsWith("http"))
    return new Promise(async (res, rej) => {
      try {
        const data = await (await fetch(path)).text();

        const hash = createHash("sha256");
        hash.update(data);
        hash.addListener("error", rej);

        return res(hash.digest("base64"));
      }
      catch(err) {
        console.error(`Failed to fetch from the URL '${path}'. Falling back to 'HASH_ERROR'.`, err);
        return res("HASH_ERROR");
      }
    });
  else
    return new Promise((res, rej) => {
      const hash = createHash("sha256");
      const stream = createReadStream(resolve(resolveResourcePath(path)));
      stream.on("data", data => hash.update(data));
      stream.on("end", () => res(hash.digest("base64")));
      stream.on("error", rej);
    });
}

/**
 * Returns the URL to a resource.  
 * In `development` mode, the resource is served by the dev server.  
 * In `production` mode, the resource is fetched using the given commit SHA or branch name (`main` by default).
 * @param mode `development` or `production`, defaults to `development`
 * @param path The path to the resource - if prefixed with a slash, it is relative to the repository root, otherwise it is relative to the `assets` directory.
 * @param buildNbrOrBranch The build number or branch name to use in the URL, defaults to `main` - this is very useful for versioned asset URLs, which will never break by changes made to the `main` branch.
 * @param calcIntegrity Whether to append the hash of the file to the URL for [Subresource Integrity.](https://www.tampermonkey.net/documentation.php?locale=en#api:Subresource_Integrity)
 */
async function getResourceUrl(mode: string, path: string, buildNbrOrBranch: string = "main", calcIntegrity = true): Promise<string> {
  const hashStr = calcIntegrity ? `#sha256=${await calculateHash(path)}` : "";

  if(path.startsWith("http"))
    return `${path}${hashStr}`;

  path = resolveResourcePath(path);

  return mode === "development"
    ? `http://localhost:${devServerPort}/${path}`
    : `https://raw.githubusercontent.com/${repo}/${buildNbrOrBranch}/${path}${hashStr}`;
}

/**
 * Resolves the path to a resource.  
 * If prefixed with a slash, the path is relative to the repository root, otherwise it is relative to the `assets` directory.
 */
function resolveResourcePath(path: string): string {
  if(path.startsWith("/"))
    return path.slice(1);
  return `assets/${path}`;
}
