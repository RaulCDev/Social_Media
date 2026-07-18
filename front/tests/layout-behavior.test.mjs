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

test("login social icons share the login action horizontal center", async () => {
  const login = await source("src/app/page.tsx");
  const styles = await source("src/app/style/globals.css");

  assert.match(login, /className="loginIcons"/);
  assert.match(styles, /\.loginIcons\s*\{[^}]*justify-content:\s*center/s);
});

test("login presents the responsive Social Media project title", async () => {
  const login = await source("src/app/page.tsx");
  const styles = await source("src/app/style/globals.css");

  assert.match(login, /<h1 className="loginTitle">Social Media<\/h1>/);
  assert.match(styles, /\.loginTitle\s*\{[^}]*font-size:\s*clamp\(2\.5rem,\s*7vw,\s*4rem\)/s);
  assert.match(styles, /\.loginTitle\s*\{[^}]*font-weight:\s*700/s);
  assert.match(styles, /\.main_text\s*\{[^}]*align-items:\s*center/s);
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
