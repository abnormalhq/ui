import { click, render } from "./support/render.tsx";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { act } from "react";
import AccordionDemo, { defaultCopy as accordionCopy } from "@/site/demos/accordion";
import AlertDialogDemo, { defaultCopy as alertDialogCopy } from "@/site/demos/alert-dialog";
import AlertDemo, { defaultCopy as alertCopy } from "@/site/demos/alert";
import AvatarDemo, { defaultCopy as avatarCopy } from "@/site/demos/avatar";
import BannerDemo, { defaultCopy as bannerCopy } from "@/site/demos/banner";
import BreadcrumbDemo, { defaultCopy as breadcrumbCopy } from "@/site/demos/breadcrumb";
import CardDemo, { defaultCopy as cardCopy } from "@/site/demos/card";
import CheckboxDemo, { defaultCopy as checkboxCopy } from "@/site/demos/checkbox";
import CollapsibleDemo, { defaultCopy as collapsibleCopy } from "@/site/demos/collapsible";
import ComboboxDemo, { defaultCopy as comboboxCopy } from "@/site/demos/combobox";
import ButtonDemo, { defaultCopy as buttonCopy } from "@/site/demos/button";
import CalendarDemo, { defaultCopy as calendarCopy } from "@/site/demos/calendar";
import CommandDemo, { defaultCopy as commandCopy } from "@/site/demos/command";
import ConfirmDialogDemo, { defaultCopy as confirmCopy } from "@/site/demos/confirm-dialog";
import ContextMenuDemo, { defaultCopy as contextMenuCopy } from "@/site/demos/context-menu";
import CopyButtonDemo, { defaultCopy as copyButtonCopy } from "@/site/demos/copy-button";
import DatePickerDemo, { defaultCopy as datePickerCopy } from "@/site/demos/date-picker";
import DateRangePickerDemo, { defaultCopy as dateRangeCopy } from "@/site/demos/date-range-picker";
import DateTimePickerDemo, { defaultCopy as dateTimeCopy } from "@/site/demos/date-time-picker";
import DescriptionListDemo, { defaultCopy as descriptionListCopy } from "@/site/demos/description-list";
import DisclosureDemo, { defaultCopy as disclosureCopy } from "@/site/demos/disclosure";
import DialogDemo, { defaultCopy as dialogCopy } from "@/site/demos/dialog";
import DropdownMenuDemo, { defaultCopy as dropdownMenuCopy } from "@/site/demos/dropdown-menu";
import EmptyStateDemo, { defaultCopy as emptyStateCopy } from "@/site/demos/empty-state";
import ExpandableTextDemo, { defaultCopy as expandableTextCopy } from "@/site/demos/expandable-text";
import FieldDemo, { defaultCopy as fieldCopy } from "@/site/demos/field";
import FieldMessageDemo, { defaultCopy as fieldMessageCopy } from "@/site/demos/field-message";
import LinkRowDemo from "@/site/demos/link-row";
import SonnerDemo, { defaultCopy as sonnerCopy } from "@/site/demos/sonner";
import TableDemo, { defaultCopy as tableCopy } from "@/site/demos/table";
import BadgeDemo, { defaultCopy as badgeCopy } from "@/site/demos/badge";
import SwitchDemo, { defaultCopy as switchCopy } from "@/site/demos/switch";

const registry = JSON.parse(readFileSync("registry.json", "utf8")) as { items: { name: string }[] };
const demoMessages = JSON.parse(readFileSync("src/i18n/messages/zh-CN.json", "utf8")).Demos;
// These demos contain only icons or loading placeholders and have no user-facing copy.
const wordlessDemos = ["icon-tile", "skeleton"] as const;
// These show structured data or utility code verbatim; the examples stay English.
const referenceCodeDemos = ["json-ld", "utils"] as const;
const defaults: Record<string, Record<string, string>> = {
  accordion: accordionCopy,
  "alert-dialog": alertDialogCopy,
  alert: alertCopy,
  avatar: avatarCopy,
  banner: bannerCopy,
  breadcrumb: breadcrumbCopy,
  card: cardCopy,
  checkbox: checkboxCopy,
  collapsible: collapsibleCopy,
  combobox: comboboxCopy,
  button: buttonCopy,
  calendar: calendarCopy,
  "confirm-dialog": confirmCopy,
  command: commandCopy,
  "context-menu": contextMenuCopy,
  "copy-button": copyButtonCopy,
  "date-picker": datePickerCopy,
  "date-range-picker": dateRangeCopy,
  "date-time-picker": dateTimeCopy,
  dialog: dialogCopy,
  "description-list": descriptionListCopy,
  disclosure: disclosureCopy,
  "dropdown-menu": dropdownMenuCopy,
  "empty-state": emptyStateCopy,
  "expandable-text": expandableTextCopy,
  field: fieldCopy,
  "field-message": fieldMessageCopy,
  sonner: sonnerCopy,
  table: tableCopy,
  badge: badgeCopy,
  switch: switchCopy,
};

const typeInput = async (input: HTMLInputElement, value: string) => {
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
};

test("demo sources remain independently runnable without site catalogs or next-intl", () => {
  for (const { name } of registry.items) {
    const source = readFileSync("src/demos/" + name + ".tsx", "utf8");
    assert.doesNotMatch(source, /from ["']@\/site\/|from ["']next-intl/);
  }
});

test("every demo is localized or documented as wordless/reference code", () => {
  const accounted = [...Object.keys(demoMessages), ...wordlessDemos, ...referenceCodeDemos];
  assert.equal(new Set(accounted).size, accounted.length);
  assert.deepEqual(accounted.toSorted(), registry.items.map(({ name }) => name).toSorted());
  for (const name of wordlessDemos) assert.equal(demoMessages[name], undefined, name);
  for (const name of referenceCodeDemos) assert.equal(demoMessages[name], undefined, name);
});

test("language switch declares target locales and preserves query/hash for auxiliary navigation", () => {
  const source = readFileSync("src/components/language-switch.tsx", "utf8");
  assert.match(source, /hrefLang="en"/);
  assert.match(source, /lang="en"/);
  assert.match(source, /hrefLang="zh-CN"/);
  assert.match(source, /lang="zh-CN"/);
  assert.match(source, /locationParts\.search, locationParts\.hash/);
  assert.match(source, /onPointerDown=/);
  assert.match(source, /onFocus=/);
});

test("LinkRow demo keeps English defaults and prefixes both row and nested link destinations", async () => {
  const source = readFileSync("src/demos/link-row.tsx", "utf8");
  assert.match(source, /<LinkRow key={href} href={destination}>/);
  assert.match(source, /<a href={destination}>/);

  const english = await render(<LinkRowDemo />);
  const chinese = await render(<LinkRowDemo hrefPrefix="/zh" />);
  const destinations = (container: HTMLElement) =>
    [...container.querySelectorAll<HTMLAnchorElement>("tbody a")].map((link) => link.getAttribute("href"));
  try {
    assert.deepEqual(destinations(english.container), ["/components/button", "/components/table"]);
    assert.deepEqual(destinations(chinese.container), ["/zh/components/button", "/zh/components/table"]);
  } finally {
    await english.unmount();
    await chinese.unmount();
  }
});

test("every localized demo copy key matches and is used by its standalone demo", async () => {
  for (const [name, copy] of Object.entries(demoMessages) as [string, Record<string, string>][]) {
    const source = readFileSync("src/demos/" + name + ".tsx", "utf8");
    const exported = defaults[name] ?? (await import("../src/demos/" + name + ".tsx")).defaultCopy;
    assert.ok(exported, name + " exports defaultCopy");
    assert.deepEqual(Object.keys(copy).toSorted(), Object.keys(exported).toSorted(), name);
    for (const key of Object.keys(copy)) {
      assert.ok(
        source.includes("copy." + key) ||
          (source.includes("copy[") && (source.includes('"' + key + '"') || source.includes("'" + key + "'"))),
        name + " uses " + key,
      );
    }
  }
});

test("translated demos show Chinese button, dialog, calendar, table, confirm and toast labels", async () => {
  const view = await render(
    <div>
      <section data-demo="button">
        <ButtonDemo copy={demoMessages.button} />
      </section>
      <section data-demo="dialog">
        <DialogDemo copy={demoMessages.dialog} />
      </section>
      <section data-demo="calendar">
        <CalendarDemo copy={demoMessages.calendar} locale="zh-CN" />
      </section>
      <section data-demo="date-picker">
        <DatePickerDemo copy={demoMessages["date-picker"]} locale="zh-CN" />
      </section>
      <section data-demo="date-range">
        <DateRangePickerDemo copy={demoMessages["date-range-picker"]} locale="zh-CN" />
      </section>
      <section data-demo="date-time">
        <DateTimePickerDemo copy={demoMessages["date-time-picker"]} locale="zh-CN" />
      </section>
      <section data-demo="table">
        <TableDemo copy={demoMessages.table} />
      </section>
      <section data-demo="confirm">
        <ConfirmDialogDemo copy={demoMessages["confirm-dialog"]} />
      </section>
      <section data-demo="toast">
        <SonnerDemo copy={demoMessages.sonner} />
      </section>
      <section data-demo="badge">
        <BadgeDemo copy={demoMessages.badge} />
      </section>
      <section data-demo="switch">
        <SwitchDemo copy={demoMessages.switch} />
      </section>
      <section data-demo="accordion">
        <AccordionDemo copy={demoMessages.accordion} />
      </section>
      <section data-demo="alert-dialog">
        <AlertDialogDemo copy={demoMessages["alert-dialog"]} />
      </section>
      <section data-demo="alert">
        <AlertDemo copy={demoMessages.alert} />
      </section>
      <section data-demo="avatar">
        <AvatarDemo copy={demoMessages.avatar} />
      </section>
      <section data-demo="banner">
        <BannerDemo copy={demoMessages.banner} />
      </section>
      <section data-demo="breadcrumb">
        <BreadcrumbDemo copy={demoMessages.breadcrumb} />
      </section>
      <section data-demo="card">
        <CardDemo copy={demoMessages.card} />
      </section>
      <section data-demo="checkbox">
        <CheckboxDemo copy={demoMessages.checkbox} />
      </section>
      <section data-demo="collapsible">
        <CollapsibleDemo copy={demoMessages.collapsible} />
      </section>
      <section data-demo="combobox">
        <ComboboxDemo copy={demoMessages.combobox} />
      </section>
      <section data-demo="command">
        <CommandDemo copy={demoMessages.command} />
      </section>
      <section data-demo="context-menu">
        <ContextMenuDemo copy={demoMessages["context-menu"]} />
      </section>
      <section data-demo="copy-button">
        <CopyButtonDemo copy={demoMessages["copy-button"]} />
      </section>
      <section data-demo="description-list">
        <DescriptionListDemo copy={demoMessages["description-list"]} />
      </section>
      <section data-demo="disclosure">
        <DisclosureDemo copy={demoMessages.disclosure} />
      </section>
      <section data-demo="dropdown-menu">
        <DropdownMenuDemo copy={demoMessages["dropdown-menu"]} />
      </section>
      <section data-demo="empty-state">
        <EmptyStateDemo copy={demoMessages["empty-state"]} />
      </section>
      <section data-demo="expandable-text">
        <ExpandableTextDemo copy={demoMessages["expandable-text"]} />
      </section>
      <section data-demo="field">
        <FieldDemo copy={demoMessages.field} />
      </section>
      <section data-demo="field-message">
        <FieldMessageDemo copy={demoMessages["field-message"]} />
      </section>
    </div>,
  );
  try {
    assert.ok(view.container.textContent?.includes("保存"));
    assert.equal(
      view.container.querySelector('[data-demo="button"] button[aria-label="添加"]')?.getAttribute("aria-label"),
      "添加",
    );
    assert.ok(view.container.querySelector('[data-demo="table"]')?.textContent?.includes("已启用"));
    assert.ok(view.container.querySelector('[data-demo="table"]')?.textContent?.includes("状态"));
    assert.ok(view.container.querySelector('[data-demo="calendar"]')?.querySelector('button[aria-label="上个月"]'));
    assert.ok(
      view.container
        .querySelector('[data-demo="accordion"]')
        ?.textContent?.includes("发送到此地址的邮件也会投递到另外两个邮箱。"),
    );
    assert.ok(view.container.querySelector('[data-demo="alert"]')?.textContent?.includes("域名已验证"));
    assert.equal(
      view.container.querySelector('[data-demo="avatar"] [aria-label="没有头像图片"]')?.getAttribute("role"),
      "img",
    );
    assert.ok(view.container.querySelector('[data-demo="breadcrumb"] [aria-label="面包屑导航"]'));
    assert.ok(view.container.querySelector('[data-demo="card"]')?.textContent?.includes("存储空间"));
    assert.ok(view.container.querySelector('[data-demo="checkbox"]')?.textContent?.includes("未选中"));
    assert.ok(view.container.querySelector('[data-demo="collapsible"]')?.textContent?.includes("邮件服务器"));
    assert.ok(view.container.querySelector('[data-demo="combobox"]')?.textContent?.includes("法兰克福"));
    assert.ok(view.container.querySelector('[data-demo="command"]')?.textContent?.includes("撰写"));
    const commandInput = view.container.querySelector<HTMLInputElement>(
      '[data-demo="command"] input[data-slot="command-input"]',
    );
    assert.ok(commandInput);
    await typeInput(commandInput, "撰写");
    const commandMatches = () => [...view.container.querySelectorAll('[data-demo="command"] [role="option"]')];
    assert.equal(commandMatches().length, 1);
    assert.ok(commandMatches()[0]?.textContent?.includes("撰写"));
    await typeInput(commandInput, "write");
    assert.equal(commandMatches().length, 1);
    assert.ok(commandMatches()[0]?.textContent?.includes("撰写"));
    await typeInput(commandInput, "");

    const comboboxTrigger = view.container.querySelector<HTMLButtonElement>(
      '[data-demo="combobox"] [data-slot="combobox-trigger"]',
    );
    assert.ok(comboboxTrigger);
    await click(comboboxTrigger);
    const regionPopup = document.body.querySelector<HTMLElement>('[role="dialog"][aria-label="搜索区域"]');
    assert.ok(regionPopup);
    const regionSearch = regionPopup.querySelector<HTMLInputElement>('input[role="combobox"]');
    assert.ok(regionSearch);
    await typeInput(regionSearch, "德国");
    const regionMatches = () => [...regionPopup.querySelectorAll('[role="option"]')];
    assert.equal(regionMatches().length, 1);
    assert.ok(regionMatches()[0]?.textContent?.includes("法兰克福"));
    assert.equal(
      view.container.querySelector<HTMLInputElement>('[data-demo="combobox"] input[name="region"]')?.value,
      "eu-central",
    );
    await typeInput(regionSearch, "Germany");
    assert.equal(regionMatches().length, 1);
    assert.ok(regionMatches()[0]?.textContent?.includes("法兰克福"));
    await typeInput(regionSearch, "");
    assert.ok(view.container.querySelector('[data-demo="context-menu"]')?.textContent?.includes("在此处单击鼠标右键"));
    assert.ok(view.container.querySelector('[data-demo="copy-button"]')?.textContent?.includes("复制链接"));
    assert.ok(view.container.querySelector('[data-demo="description-list"]')?.textContent?.includes("已连接"));
    assert.ok(view.container.querySelector('[data-demo="description-list"]')?.textContent?.includes("合计"));
    assert.ok(view.container.querySelector('[data-demo="disclosure"]')?.textContent?.includes("之后可以更改套餐吗？"));
    assert.ok(view.container.querySelector('[data-demo="dropdown-menu"]')?.textContent?.includes("选项"));
    assert.ok(view.container.querySelector('[data-demo="empty-state"]')?.textContent?.includes("还没有邮箱"));
    assert.ok(
      view.container.querySelector('[data-demo="expandable-text"]')?.textContent?.includes("邮箱迁移已于昨夜完成"),
    );
    assert.ok(view.container.querySelector('[data-demo="field"]')?.textContent?.includes("显示名称"));
    assert.ok(view.container.querySelector('[data-demo="field-message"]')?.textContent?.includes("正在检查此地址。"));
    assert.ok(view.container.querySelector('[data-demo="banner"] button[aria-label="关闭通知"]'));
    assert.ok(document.body.querySelector('[aria-label="通知"]'));

    const clickButton = async (scope: ParentNode, text: string) => {
      const button = [...scope.querySelectorAll("button")].find((element) => element.textContent?.trim() === text);
      assert.ok(button, text);
      await act(async () => {
        button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });
    };
    await clickButton(view.container.querySelector('[data-demo="dialog"]')!, "重命名邮箱");
    assert.ok(document.body.textContent?.includes("向旧地址发送邮件的人会收到退信。"));
    assert.equal(document.body.querySelector('[data-slot="dialog-close"]')?.textContent?.trim(), "关闭");

    await clickButton(view.container.querySelector('[data-demo="confirm"]')!, "删除邮箱");
    assert.ok(document.body.textContent?.includes("确定要删除此邮箱吗？"));

    await clickButton(view.container.querySelector('[data-demo="alert-dialog"]')!, "删除邮箱");
    assert.ok(document.body.textContent?.includes("邮箱中的邮件将被永久删除，且无法恢复。"));

    const dropdownTrigger = view.container.querySelector('[data-demo="dropdown-menu"] button')!;
    await act(async () => {
      dropdownTrigger.dispatchEvent(
        new PointerEvent("pointerdown", { bubbles: true, cancelable: true, button: 0, pointerType: "mouse" }),
      );
    });
    assert.ok(document.body.textContent?.includes("仅未读"));

    await clickButton(view.container.querySelector('[data-demo="toast"]')!, "成功");
    await act(async () => new Promise((resolve) => setTimeout(resolve, 25)));
    assert.ok(document.body.textContent?.includes("消息已发送"));
  } finally {
    await view.unmount();
  }
});

test("remaining demos render Chinese copy and stateful labels stay localized", async () => {
  const names = [
    "bento",
    "brand-mark",
    "code-block",
    "file-button",
    "input-group",
    "language-picker",
    "item-list",
    "native-select",
    "page-header",
    "pricing-card",
    "prose",
    "selection-bar",
    "sidebar",
    "stat",
    "tag",
    "theme-picker",
    "theme",
    "timeline",
    "workspace",
  ];
  const examples = await Promise.all(
    names.map(async (name) => ({
      name,
      Demo: (await import("../src/demos/" + name + ".tsx")).default,
    })),
  );
  const SidebarDemo = examples.find(({ name }) => name === "sidebar")!.Demo;
  const view = await render(
    <div>
      {examples.map(({ name, Demo }) => (
        <section key={name} data-demo={name}>
          <Demo copy={demoMessages[name]} />
        </section>
      ))}
      <section data-demo="sidebar-default">
        <SidebarDemo />
      </section>
    </div>,
  );
  try {
    assert.ok(view.container.querySelector('[data-demo="page-header"]')?.textContent?.includes("新建邮箱"));
    assert.ok(view.container.querySelector('[data-demo="native-select"]')?.textContent?.includes("团队版"));
    assert.ok(view.container.querySelector('[data-demo="prose"]')?.textContent?.includes("我们收集的信息"));
    assert.ok(
      view.container.querySelector('[data-demo="prose"]')?.textContent?.includes("以及每封邮件的 Message-ID。"),
    );
    assert.ok(view.container.querySelector('[data-demo="item-list"]')?.textContent?.includes("macOS 上的 Firefox"));
    assert.ok(view.container.querySelector('[data-demo="item-list"]')?.textContent?.includes("iPhone 上的 Mail"));
    assert.ok(view.container.querySelector('[data-demo="language-picker"]')?.textContent?.includes("English"));
    assert.ok(view.container.querySelector('[data-demo="theme"]')?.textContent?.includes("墨色外壳"));
    assert.ok(view.container.querySelector('[data-demo="workspace"]')?.textContent?.includes("宽敞的阅读区域"));
    assert.ok(
      view.container.querySelector('[data-demo="sidebar-default"]')?.textContent?.includes("The page for inbox."),
    );
    assert.ok(view.container.querySelector('[data-demo="tag"] button[aria-label="移除 example.com"]'));

    const removeDomain = view.container.querySelector('[data-demo="tag"] button[aria-label="移除 example.com"]')!;
    await act(async () => removeDomain.dispatchEvent(new MouseEvent("click", { bubbles: true })));
    const domainTags = view.container.querySelector('[data-demo="tag"] ul')!;
    assert.equal(
      [...domainTags.querySelectorAll("li")].some((item) => item.textContent?.includes("@example.com")),
      false,
    );
  } finally {
    await view.unmount();
  }
});
