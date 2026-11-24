import { render } from "./support/render.tsx";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { afterEach, test } from "node:test";
import { act } from "react";
import { NextIntlClientProvider } from "next-intl";
import { SiteNav } from "@/site/components/site-nav";
import { localeHref, localeSwitchHref } from "@/site/i18n/locale-path";

const registry = JSON.parse(readFileSync("registry.json", "utf8")) as { items: { name: string }[] };
const mounted: { unmount: () => Promise<void> }[] = [];

afterEach(async () => {
  for (const view of mounted.splice(0)) await view.unmount();
});

test("English and Chinese static routes exist for every site page and registry item", () => {
  for (const path of ["index", "design", "gallery", ...registry.items.map(({ name }) => "components/" + name)]) {
    assert.ok(existsSync("out/" + path + ".html"), "English " + path);
    assert.ok(existsSync("out/" + (path === "index" ? "zh" : "zh/" + path) + ".html"), "Chinese " + path);
  }
  const copy = JSON.parse(readFileSync("src/i18n/registry-copy/zh-CN.json", "utf8"));
  assert.deepEqual(Object.keys(copy).toSorted(), registry.items.map(({ name }) => name).toSorted());
});

test("static pages render their locale, page metadata and translated copy", () => {
  const english = readFileSync("out/index.html", "utf8");
  const chinese = readFileSync("out/zh.html", "utf8");
  assert.match(english, /<html[^>]*lang="en"/);
  assert.match(
    english,
    /name="description" content="The shared design system and shadcn registry behind the Abnormal family\."/,
  );
  assert.match(english, /Design tokens, base components and brand pieces shared by the Abnormal family/);
  assert.match(english, />Browse the component gallery</);

  assert.match(chinese, /<html[^>]*lang="zh-CN"/);
  assert.match(chinese, /name="description" content="Abnormal 家族共用的设计系统与 shadcn 注册表。"/);
  assert.match(chinese, /Abnormal 家族共用的设计令牌、基础组件与品牌元素/);
  assert.match(chinese, />浏览组件画廊</);

  const englishDesign = readFileSync("out/design.html", "utf8");
  const chineseDesign = readFileSync("out/zh/design.html", "utf8");
  assert.match(englishDesign, /<title>Family style · Abnormal UI<\/title>/);
  assert.match(chineseDesign, /<title>家族风格 · Abnormal UI<\/title>/);
  assert.match(chineseDesign, /纸色、墨色与一抹荧光/);
  assert.match(chineseDesign, /所有系统运行正常/);

  const englishButton = readFileSync("out/components/button.html", "utf8");
  const chineseButton = readFileSync("out/zh/components/button.html", "utf8");
  assert.match(englishButton, /<title>Button · Abnormal UI<\/title>/);
  assert.match(chineseButton, /<title>按钮 · Abnormal UI<\/title>/);
  assert.match(chineseButton, /高度为 32px 的按钮/);

  const englishGallery = readFileSync("out/gallery.html", "utf8");
  const chineseGallery = readFileSync("out/zh/gallery.html", "utf8");
  assert.match(englishGallery, /<title>Component gallery · Abnormal UI<\/title>/);
  assert.match(chineseGallery, /<title>组件画廊 · Abnormal UI<\/title>/);

  const notFound = readFileSync("out/404.html", "utf8");
  assert.match(notFound, /<html[^>]*lang="en"/);
  assert.match(notFound, /data-slot="not-found"/);
  assert.match(notFound, /Nothing here/);
  assert.match(notFound, /<div[^>]*lang="zh-CN"[^>]*>.*这里什么也没有/s);
  assert.match(notFound, /Back to the overview/);
  assert.match(notFound, /中文首页/);
});

test("exported LinkRow pages keep row links in the current locale", () => {
  const english = readFileSync("out/components/link-row.html", "utf8");
  const chinese = readFileSync("out/zh/components/link-row.html", "utf8");
  for (const [name, path] of [
    ["Button", "/components/button"],
    ["Table", "/components/table"],
  ]) {
    assert.ok(english.includes(`<a href="${path}">${name}</a>`), `English ${path}`);
    assert.ok(chinese.includes(`<a href="/zh${path}">${name}</a>`), `Chinese ${path}`);
  }
});

test("locale links preserve app paths without prefixing reference and fragment URLs", () => {
  const englishDesign = readFileSync("out/design.html", "utf8");
  const chineseDesign = readFileSync("out/zh/design.html", "utf8");
  assert.match(englishDesign, /href="\/zh\/design"/);
  assert.match(chineseDesign, /href="\/design"/);
  const languageNav = chineseDesign.match(/<nav aria-label="语言"[^>]*>(.*?)<\/nav>/s)?.[1] ?? "";
  assert.ok(languageNav.indexOf("English") < languageNav.indexOf("中文"));
  assert.match(chineseDesign, /href="\/zh\/components\/workspace"/);
  assert.match(chineseDesign, /href="\/md\/design\.md"/);
  assert.doesNotMatch(chineseDesign, /href="\/zh\/md\//);

  assert.equal(localeHref("zh-CN", "/components/button"), "/zh/components/button");
  assert.equal(localeHref("en", "/zh/components/button"), "/components/button");
  assert.equal(localeHref("zh-CN", "/r/registry.json"), "/r/registry.json");
  assert.equal(localeHref("zh-CN", "/source/button.tsx"), "/source/button.tsx");
  assert.equal(localeHref("zh-CN", "/md/design.md"), "/md/design.md");
  assert.equal(localeHref("zh-CN", "#palette"), "#palette");
  assert.equal(localeHref("zh-CN", "https://example.com/design"), "https://example.com/design");
  assert.equal(localeSwitchHref("zh-CN", "/design", "?tab=palette", "#type"), "/zh/design?tab=palette#type");
  assert.equal(localeSwitchHref("en", "/zh/design", "?tab=palette", "#type"), "/design?tab=palette#type");
});

test("Chinese client search matches translated titles and group labels, and keeps registry identifiers searchable", async () => {
  const messages = JSON.parse(readFileSync("src/i18n/messages/zh-CN.json", "utf8"));
  const view = await render(
    <NextIntlClientProvider locale="zh-CN" timeZone="UTC" messages={{ Navigation: messages.Navigation }}>
      <SiteNav
        locale="zh-CN"
        groups={[
          {
            title: "控件",
            items: [
              { name: "toggle-group", title: "切换按钮组" },
              { name: "button", title: "按钮" },
            ],
          },
        ]}
      />
    </NextIntlClientProvider>,
  );
  mounted.push(view);
  const input = view.container.querySelector("input")!;
  const search = async (value: string) => {
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, value);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
  };

  await search("切换");
  assert.equal(view.container.querySelector('[role="status"]')?.textContent, "找到 1 个匹配项");
  assert.equal(view.container.querySelector('a[href="/zh/components/toggle-group"]')?.textContent, "切换按钮组");

  await search("控件");
  assert.equal(view.container.querySelector('[role="status"]')?.textContent, "找到 2 个匹配项");

  await search("toggle-group");
  assert.equal(view.container.querySelector('[role="status"]')?.textContent, "找到 1 个匹配项");

  await search("无匹配内容");
  assert.equal(view.container.querySelector('[role="status"]')?.textContent, "没有匹配项");
});
