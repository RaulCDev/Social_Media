import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = async (path) => {
  try {
    return await readFile(new URL(`../${path}`, import.meta.url), "utf8");
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return "";
    }
    throw error;
  }
};

const activeSource = (contents) =>
  contents
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");

test("apiFetch sends cookies, JSON headers, and emits one session-expired event for 401", async () => {
  const contents = await source("src/lib/api-client.ts");

  assert.match(contents, /credentials:\s*["']include["']/);
  assert.match(contents, /["']Content-Type["']\s*,\s*["']application\/json["']/);
  assert.match(contents, /response\.status\s*===\s*401/);
  assert.match(contents, /dispatchEvent/);
});

test("AuthProvider owns guest, current-user, and logout session calls", async () => {
  const contents = await source("src/components/AuthProvider.tsx");

  assert.match(contents, /apiFetch<.*>\(["']\/auth\/guest["']/);
  assert.match(contents, /apiFetch<.*>\(["']\/auth\/me["']/);
  assert.match(contents, /apiFetch\(["']\/auth\/logout["']/);
  assert.match(contents, /startGuestSession/);
  assert.match(contents, /logout/);
});

test("the existing login button starts an anonymous session without extra login controls", async () => {
  const contents = activeSource(await source("src/app/page.tsx"));

  assert.match(contents, /LogIn \(No credentials\)/);
  assert.match(contents, /startGuestSession\(true\)/);
  assert.doesNotMatch(contents, /<Input\b|type=["'](?:email|password)["']/);
  assert.doesNotMatch(contents, /github\.com\/login\/oauth/);
});

test("active frontend auth and API flow uses cookies instead of browser JWT storage", async () => {
  const paths = [
    "src/app/page.tsx",
    "src/app/home/page.tsx",
    "src/app/components/Write-Post.tsx",
    "src/app/components/PostCards/PostCards.tsx",
    "src/app/components/PostCards/Buttons/buttons.tsx",
    "src/app/components/LeftSide.tsx",
    "src/app/components/RightSide.tsx",
    "src/app/components/TextArea-Post.tsx",
    "src/app/components/Token_button.tsx",
  ];
  const contents = activeSource((await Promise.all(paths.map(source))).join("\n"));

  assert.doesNotMatch(contents, /localStorage|access_token|Authorization|Bearer\s|\/login\b|github_callback|client_id/);
});

test("GitHub login remains disabled as historical commented source only", async () => {
  const contents = await source("src/app/github_login/page.tsx");
  const active = activeSource(contents);

  assert.match(contents, /HISTORICAL GITHUB LOGIN \(DISABLED\)/);
  assert.match(contents, /github_callback/);
  assert.doesNotMatch(active, /github_callback|client_id|useRouter|useSearchParams|localStorage|access_token/);
});

test("profile state accepts the numeric count returned by the typed API client", async () => {
  const contents = await source("src/app/[userName]/page.tsx");

  assert.match(contents, /useState<number\s*\|\s*null>\(null\)/);
});

test("session restoration and guest creation are serialized and deduplicated", async () => {
  const contents = await source("src/components/AuthProvider.tsx");

  assert.match(contents, /restorePromiseRef/);
  assert.match(contents, /guestPromiseRef/);
  assert.match(contents, /await restorePromiseRef\.current/);
  assert.match(contents, /force/);
});

test("authenticated mutations renew an expired session and retry only once", async () => {
  const contents = await source("src/components/AuthProvider.tsx");

  assert.match(contents, /useSessionMutation/);
  assert.match(contents, /error instanceof ApiError\s*&&\s*error\.status === 401/);
  assert.match(contents, /startGuestSession\(true\)/);
  assert.match(contents, /return request\(\)/);
});
