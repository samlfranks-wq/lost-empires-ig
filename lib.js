// Shared helpers for the Instagram publisher.
// Zero dependencies — Node 18+ native fetch, and a tiny .env reader so no
// npm install is needed.

import {readFileSync, existsSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

export function loadEnv(required = ['IG_USER_ID', 'IG_ACCESS_TOKEN']) {
  const path = join(HERE, '.env');
  // CI (GitHub Actions) has no .env — the values arrive as repo secrets in the
  // environment instead. Locally the file still wins, so nothing changes here.
  if (!existsSync(path)) {
    const fromProcess = {};
    for (const k of ['IG_USER_ID', 'IG_ACCESS_TOKEN', 'AUTH_MODE', 'GRAPH_VERSION']) {
      if (process.env[k]) fromProcess[k] = process.env[k];
    }
    const missingEnv = required.filter((k) => !fromProcess[k]);
    if (missingEnv.length) {
      fail(
        [
          'No .env file, and missing from the environment: ' + missingEnv.join(', '),
          'Locally: copy .env.example to .env and fill it in.',
          'In GitHub Actions: add them as repository secrets.',
        ].join(String.fromCharCode(10))
      );
    }
    fromProcess.GRAPH_VERSION = fromProcess.GRAPH_VERSION || 'v23.0';
    fromProcess.AUTH_MODE = (fromProcess.AUTH_MODE || 'instagram').toLowerCase();
    fromProcess.GRAPH_HOST =
      fromProcess.AUTH_MODE === 'facebook' ? 'graph.facebook.com' : 'graph.instagram.com';
    return fromProcess;
  }
  const env = {};
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const i = trimmed.indexOf('=');
    if (i === -1) continue;
    // strip optional surrounding quotes
    env[trimmed.slice(0, i).trim()] = trimmed
      .slice(i + 1)
      .trim()
      .replace(/^["']|["']$/g, '');
  }
  const missing = required.filter((k) => !env[k]);
  if (missing.length) fail(`Missing in .env: ${missing.join(', ')}`);
  env.GRAPH_VERSION = env.GRAPH_VERSION || 'v23.0';
  // Two auth paths exist. "instagram" = Instagram API with Instagram Login
  // (direct IG auth, no Facebook Page needed) — this is what we use.
  // "facebook" = the older Page-linked Graph API. Same publishing endpoints,
  // different host and a different way of finding your account ID.
  env.AUTH_MODE = (env.AUTH_MODE || 'instagram').toLowerCase();
  env.GRAPH_HOST =
    env.AUTH_MODE === 'facebook' ? 'graph.facebook.com' : 'graph.instagram.com';
  return env;
}

// Abort with a message. Sets the exit code and throws rather than calling
// process.exit(), which on Windows crashes with a libuv assertion if a fetch
// socket is still closing.
export class Abort extends Error {}

// fail() has already printed the message, so an Abort reaching the top level
// should end the process quietly rather than dumping a stack trace.
for (const ev of ['uncaughtException', 'unhandledRejection']) {
  process.on(ev, (err) => {
    if (!(err instanceof Abort)) console.error(err);
    process.exitCode = 1;
  });
}

export function fail(msg) {
  console.error(`\n✖ ${msg}\n`);
  process.exitCode = 1;
  throw new Abort(msg);
}

const base = (env) => `https://${env.GRAPH_HOST}/${env.GRAPH_VERSION}`;

/** GET/POST against the Graph API with useful error surfacing. */
export async function graph(env, path, {method = 'GET', params = {}} = {}) {
  const url = new URL(`${base(env)}/${path}`);
  const body = new URLSearchParams({...params, access_token: env.IG_ACCESS_TOKEN});
  let res;
  if (method === 'GET') {
    url.search = body.toString();
    res = await fetch(url);
  } else {
    res = await fetch(url, {method, body});
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.error) {
    const e = json.error || {};
    throw new Error(
      `Graph API ${res.status}: ${e.message || 'unknown error'}` +
        (e.error_user_msg ? `\n   ${e.error_user_msg}` : '') +
        (e.code ? `\n   (code ${e.code}${e.error_subcode ? `/${e.error_subcode}` : ''})` : '')
    );
  }
  return json;
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
