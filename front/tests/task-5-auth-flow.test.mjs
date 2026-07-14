import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const loadSessionFlow = async () => {
  try {
    return await import("../src/lib/session-flow.mjs");
  } catch (error) {
    if (error && error.code === "ERR_MODULE_NOT_FOUND") {
      return {};
    }
    throw error;
  }
};

const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
};

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
  assert.match(contents, /\.catch\(error => \{/);
  assert.match(contents, /\}, \[pathname, searchParams\]\);/);
  assert.match(contents, /return \(\s*<div>\s*<PacmanLoader/);
  assert.match(contents, /fallback=\{\s*<div>\s*<PacmanLoader/);
  assert.doesNotMatch(active, /github_callback|client_id|useRouter|useSearchParams|localStorage|access_token/);
});

test("profile state accepts the numeric count returned by the typed API client", async () => {
  const contents = await source("src/app/[userName]/page.tsx");

  assert.match(contents, /useState<number\s*\|\s*null>\(null\)/);
});

test("session restoration finishes before concurrent guest calls create exactly one guest", async () => {
  const { createSessionFlow } = await loadSessionFlow();
  assert.equal(typeof createSessionFlow, "function");

  const restore = deferred();
  const guest = deferred();
  const order = [];
  let restoreCalls = 0;
  let guestCalls = 0;
  const flow = createSessionFlow({
    restoreSession: () => {
      restoreCalls += 1;
      order.push("restore:start");
      return restore.promise;
    },
    createGuestSession: () => {
      guestCalls += 1;
      order.push("guest:start");
      return guest.promise;
    },
  });

  const restoration = flow.restore();
  const duplicateRestoration = flow.restore();
  const firstGuest = flow.startGuestSession();
  const secondGuest = flow.startGuestSession();
  await Promise.resolve();

  assert.deepEqual(order, ["restore:start"]);
  assert.equal(restoreCalls, 1);
  assert.equal(guestCalls, 0);

  restore.resolve(null);
  await Promise.all([restoration, duplicateRestoration]);
  await Promise.resolve();
  assert.deepEqual(order, ["restore:start", "guest:start"]);
  assert.equal(guestCalls, 1);

  const guestUser = { id: 7, username: "guest-7" };
  guest.resolve(guestUser);
  assert.deepEqual(await Promise.all([firstGuest, secondGuest]), [guestUser, guestUser]);
  assert.equal(guestCalls, 1);
});

test("an expired cookie causes one renewal followed by one successful retry in order", async () => {
  const { runSessionMutation } = await loadSessionFlow();
  assert.equal(typeof runSessionMutation, "function");

  const order = [];
  let requestCalls = 0;
  let renewalCalls = 0;
  const result = await runSessionMutation({
    hasSession: true,
    startGuestSession: async (force) => {
      renewalCalls += 1;
      order.push(`guest:${force}`);
    },
    request: async () => {
      requestCalls += 1;
      order.push(`request:${requestCalls}`);
      if (requestCalls === 1) throw { status: 401 };
      return "created";
    },
    isUnauthorized: (error) => error?.status === 401,
  });

  assert.equal(result, "created");
  assert.equal(renewalCalls, 1);
  assert.equal(requestCalls, 2);
  assert.deepEqual(order, ["request:1", "guest:true", "request:2"]);
});

test("a second 401 is returned without another renewal or retry loop", async () => {
  const { runSessionMutation } = await loadSessionFlow();
  assert.equal(typeof runSessionMutation, "function");

  let requestCalls = 0;
  let renewalCalls = 0;
  await assert.rejects(
    runSessionMutation({
      hasSession: true,
      startGuestSession: async () => {
        renewalCalls += 1;
      },
      request: async () => {
        requestCalls += 1;
        throw { status: 401 };
      },
      isUnauthorized: (error) => error?.status === 401,
    }),
    (error) => error?.status === 401,
  );

  assert.equal(renewalCalls, 1);
  assert.equal(requestCalls, 2);
});
