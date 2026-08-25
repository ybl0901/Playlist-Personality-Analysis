import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    {
      ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
    },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the 听见你 product shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>听见你｜从歌单读懂你的性格与风格<\/title>/);
  assert.match(html, /你的歌单，/);
  assert.match(html, /音乐痕迹/);
  assert.match(html, /不构成心理评估/);
  assert.doesNotMatch(html, /Your site is taking shape|Building your site/);
});

test("includes the report upgrade surfaces", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(page, /OCEAN PROFILE/);
  assert.match(page, /LISTENING DNA/);
  assert.match(page, /你的音乐心路历程/);
  assert.match(page, /YOUR MUSIC PERSONA/);
  assert.match(page, /音乐人格形象/);
});
