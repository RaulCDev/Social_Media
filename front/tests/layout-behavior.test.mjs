import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = async (path) =>
  readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("post typography and action icons use readable timeline sizes", async () => {
  const card = await source("src/app/components/PostCards/PostCard.tsx");
  const buttons = await source("src/app/components/PostCards/Buttons/buttons.tsx");

  assert.match(card, /postAuthorName/);
  assert.match(card, /postAuthorHandle/);
  assert.match(card, /postContent/);
  assert.match(buttons, /postActionIcon/);
  assert.match(buttons, /postActionCount/);
});

test("maintained frontend sources contain no debug logs or visible menu typos", async () => {
  const paths = [
    "src/app/[userName]/page.tsx",
    "src/app/components/LeftSide.tsx",
    "src/app/components/PostCards/PostCards.tsx",
    "src/app/components/RightSide.tsx",
    "src/app/components/TextArea-Post.tsx",
    "src/app/components/Write-Post.tsx",
  ];
  const contents = (await Promise.all(paths.map(source))).join("\n");

  assert.doesNotMatch(contents, /console\.log\s*\(/);
  assert.match(contents, /Monetization/);
  assert.doesNotMatch(contents, /MOnetization/);
  assert.match(contents, /placeholder="Search"/);
  assert.match(contents, /Load more posts/);
  assert.doesNotMatch(contents, /Buscar|Cargar más tarjetas/);
});

test("login uses semantic personal links and omits the unused X action", async () => {
  const login = await source("src/app/page.tsx");

  assert.match(login, /<main className="bigLoginContainer">/);
  assert.match(login, /<section className="loginPanel"/);
  assert.match(login, /className="loginButton"/);
  assert.match(login, /<nav className="loginLinks"/);
  assert.match(login, /href="https:\/\/www\.linkedin\.com\/in\/ra%C3%BAl-conde-rodr%C3%ADguez\/"/);
  assert.match(login, /href="https:\/\/github\.com\/RaulCDev"/);
  assert.equal((login.match(/target="_blank"/g) ?? []).length, 2);
  assert.equal((login.match(/rel="noopener noreferrer"/g) ?? []).length, 2);
  assert.match(login, /className="loginLinksDivider" aria-hidden="true"/);
  assert.doesNotMatch(login, /IconBrandX/);
  assert.doesNotMatch(login, /<button[^>]*>\s*<a/s);
});

test("login matches the approved centered responsive visual system", async () => {
  const login = await source("src/app/page.tsx");
  const styles = await source("src/app/style/globals.css");

  assert.match(login, /className="loginTitle">\s*Social Media\s*<\/h1>/);
  assert.match(login, /className="loginErrorSlot"/);
  assert.match(styles, /\.bigLoginContainer\s*\{[^}]*min-height:\s*100svh/s);
  assert.match(styles, /\.bigLoginContainer\s*\{[^}]*background:\s*#07080b/s);
  assert.match(styles, /\.loginPanel\s*\{[^}]*width:\s*min\(100%,\s*26\.75rem\)/s);
  assert.match(styles, /\.loginTitle\s*\{[^}]*font-size:\s*clamp\(/s);
  assert.match(styles, /\.loginTitle\s*\{[^}]*font-weight:\s*700/s);
  assert.match(styles, /\.loginButton\s*\{[^}]*background:\s*rgb\(1,\s*147,\s*89\)/s);
  assert.match(styles, /\.loginButton\s*\{[^}]*box-shadow:[^}]*rgba\(1,\s*147,\s*89,/s);
  assert.match(styles, /\.loginButton:hover\s*\{[^}]*background:\s*rgb\(2,\s*166,\s*100\)/s);
  assert.match(styles, /\.loginButton:active\s*\{[^}]*background:\s*rgb\(1,\s*126,\s*76\)/s);
  assert.match(styles, /\.loginButton:focus-visible,[^}]*outline:\s*3px solid #8ee8bd/s);
  assert.match(styles, /\.loginErrorSlot\s*\{[^}]*min-height:/s);
  assert.match(styles, /\.loginButton:focus-visible/);
  assert.match(styles, /\.loginLink:focus-visible/);
  assert.match(styles, /@media\s*\(max-width:\s*480px\)/);
  assert.match(styles, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
});

test("the More menu is positioned above its own button", async () => {
  const leftSide = await source("src/app/components/LeftSide.tsx");
  const styles = await source("src/app/style/globals.css");

  assert.match(leftSide, /moreMenuAnchor/);
  assert.match(styles, /\.moreMenuAnchor\s*\{[^}]*position:\s*relative/s);
  assert.match(styles, /\.dropdown\s*\{[^}]*bottom:\s*calc\(100%\s*\+\s*8px\)/s);
  assert.doesNotMatch(styles, /\.dropdown\s*\{[^}]*top:\s*50px/s);
});

test("the right rail scroll follows measured content instead of a fixed offset", async () => {
  const rightSide = await source("src/app/components/RightSide.tsx");
  const hook = await source("src/app/components/hook/useScreenHeight.tsx");
  const styles = await source("src/app/style/globals.css");

  assert.doesNotMatch(rightSide, /bottom:\s*["']-500px["']/);
  assert.match(hook, /scrollHeight/);
  assert.match(hook, /--right-rail-height/);
  assert.match(styles, /calc\(100vh\s*-\s*var\(--right-rail-height\)\s*-\s*12px\)/);
  assert.doesNotMatch(hook, /translate3d/);
  assert.doesNotMatch(hook, /500/);
});

test("sidebar sections replace the feed with a centered workspace label", async () => {
  const home = await source("src/app/home/page.tsx");
  const leftSide = await source("src/app/components/LeftSide.tsx");
  const styles = await source("src/app/style/globals.css");

  for (const section of [
    "Search",
    "Notifications",
    "Messages",
    "Lists",
    "Premium",
    "Profile",
    "Bookmarks",
    "Communities",
  ]) {
    assert.match(leftSide, new RegExp(`section:\\s*["']${section}["']`));
  }

  assert.match(home, /useState<SidebarSection>\(null\)/);
  assert.match(home, /activeSection\s*\?/);
  assert.match(home, /sectionWorkspace homeContentArea/);
  assert.match(home, /main className="homeContentArea"/);
  assert.match(home, /\{activeSection\}/);
  assert.match(styles, /\.homeContentArea\s*\{[^}]*width:\s*978px/s);
  assert.match(styles, /\.homeContentArea\s*\{[^}]*flex:\s*0 0 978px/s);
  assert.doesNotMatch(styles, /\.sectionWorkspace\s*\{[^}]*flex:\s*1/s);
  assert.match(styles, /\.sectionWorkspace\s*\{[^}]*align-items:\s*center/s);
  assert.match(styles, /\.sectionWorkspace\s*\{[^}]*justify-content:\s*center/s);
  assert.match(styles, /html\s*\{[^}]*scrollbar-gutter:\s*stable/s);
});
