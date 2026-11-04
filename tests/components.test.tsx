// The browser environment has to come first: see support/dom.ts.
import { click, render } from "./support/render.tsx";
import assert from "node:assert/strict";
import { afterEach, mock, test } from "node:test";
import { act } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { rowClickHandler } from "@/components/ui/table-row";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CopyButton } from "@/site/components/copy-button";

const mounted: { unmount: () => Promise<void> }[] = [];
const mount = async (ui: React.ReactNode) => {
  const view = await render(ui);
  mounted.push(view);
  return view;
};
afterEach(async () => {
  for (const view of mounted.splice(0)) await view.unmount();
  mock.restoreAll();
});

const button = (name: string) => {
  const match = [...document.querySelectorAll("button")].find(
    (element) => (element.getAttribute("aria-label") ?? element.textContent?.trim()) === name,
  );
  assert.ok(match, `a button named ${name}`);
  return match;
};

test("a Tooltip works without a TooltipProvider, and inside one", async () => {
  await mount(
    <Tooltip open>
      <TooltipTrigger>Info</TooltipTrigger>
      <TooltipContent>Archived after 30 days</TooltipContent>
    </Tooltip>,
  );
  assert.match(document.body.textContent ?? "", /Archived after 30 days/);

  await mount(
    <TooltipProvider>
      <Tooltip open>
        <TooltipTrigger>Spam</TooltipTrigger>
        <TooltipContent>Emptied every 30 days</TooltipContent>
      </Tooltip>
    </TooltipProvider>,
  );
  assert.match(document.body.textContent ?? "", /Emptied every 30 days/);
});

test("an uncontrolled Switch toggles, and submits like a checkbox", async () => {
  const { container } = await mount(
    <form>
      <Switch name="digest" defaultChecked aria-label="Weekly digest" />
    </form>,
  );
  const form = container.querySelector("form")!;
  const toggle = button("Weekly digest");
  assert.equal(toggle.getAttribute("aria-checked"), "true");
  assert.match(toggle.className, /\bpeer\b/);
  assert.equal(new FormData(form).get("digest"), "on");

  await click(toggle);
  assert.equal(toggle.getAttribute("aria-checked"), "false");
  assert.equal(new FormData(form).get("digest"), null);
});

test("a controlled Switch reports the change and waits for its owner", async () => {
  const onCheckedChange = mock.fn();
  const { container } = await mount(
    <form>
      <Switch name="notify" value="email" checked={false} onCheckedChange={onCheckedChange} aria-label="Notify" />
      <Switch name="muted" checked disabled onCheckedChange={() => {}} aria-label="Muted" />
    </form>,
  );
  await click(button("Notify"));
  assert.deepEqual(
    onCheckedChange.mock.calls.map(({ arguments: args }) => args),
    [[true]],
  );
  assert.equal(button("Notify").getAttribute("aria-checked"), "false");
  // A disabled switch is left out of the form, like a disabled checkbox.
  const data = new FormData(container.querySelector("form")!);
  assert.deepEqual([...data.keys()], []);
});

test("rowClickHandler opens the row, but not from its buttons, other mouse buttons or a text selection", async () => {
  const activate = mock.fn();
  await mount(
    <Table>
      <TableBody>
        <TableRow onClick={rowClickHandler(activate)}>
          <TableCell>hello@example.com</TableCell>
          <TableCell>
            <button type="button">Copy</button>
            <span data-row-ignore>Pinned</span>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>,
  );
  const cell = [...document.querySelectorAll("td")].find(({ textContent }) => textContent === "hello@example.com")!;
  await click(cell);
  assert.equal(activate.mock.callCount(), 1);

  await click(button("Copy"));
  await click(document.querySelector("[data-row-ignore]")!);
  await click(cell, { button: 1 });
  assert.equal(activate.mock.callCount(), 1);

  mock.method(window, "getSelection", () => ({ toString: () => "hello" }));
  await click(cell);
  assert.equal(activate.mock.callCount(), 1);
});

test("a Table marks hidden content to the right and a scrolled header", async () => {
  const { container } = await mount(
    <Table>
      <TableBody>
        <TableRow>
          <TableCell>wide</TableCell>
        </TableRow>
      </TableBody>
    </Table>,
  );
  const scroller = container.querySelector<HTMLElement>('[data-slot="table-container"]')!;
  const layout = { scrollLeft: 0, clientWidth: 300, scrollWidth: 800, scrollTop: 0 };
  for (const key of Object.keys(layout) as (keyof typeof layout)[]) {
    Object.defineProperty(scroller, key, { configurable: true, get: () => layout[key] });
  }
  const scroll = () => act(async () => void scroller.dispatchEvent(new Event("scroll")));

  await scroll();
  assert.equal(scroller.dataset.overflow, "end");
  assert.equal(scroller.dataset.scrolled, undefined);

  Object.assign(layout, { scrollLeft: 500, scrollTop: 40 });
  await scroll();
  assert.equal(scroller.dataset.overflow, undefined);
  assert.equal(scroller.dataset.scrolled, "true");
});

test("Dialog and Sheet name their close buttons with the label they are given", async () => {
  await mount(
    <Dialog open>
      <DialogContent closeLabel="关闭">
        <DialogTitle>重命名</DialogTitle>
        <DialogDescription>旧名字会退信。</DialogDescription>
        <DialogFooter showCloseButton closeLabel="取消" />
      </DialogContent>
    </Dialog>,
  );
  assert.ok(button("关闭"));
  assert.ok(button("取消"));
  await mounted.pop()!.unmount();

  await mount(
    <Dialog open>
      <DialogContent showCloseButton={false}>
        <DialogTitle>Rename</DialogTitle>
        <DialogDescription>No close button.</DialogDescription>
      </DialogContent>
    </Dialog>,
  );
  assert.equal(document.querySelectorAll("button").length, 0);
  await mounted.pop()!.unmount();

  await mount(
    <Sheet open>
      <SheetContent closeLabel="Close details">
        <SheetTitle>hello@example.com</SheetTitle>
        <SheetDescription>Details</SheetDescription>
      </SheetContent>
    </Sheet>,
  );
  assert.ok(button("Close details"));
});

test("the site's copy button reports a failed copy instead of throwing", async () => {
  const clipboard = (value: unknown) => Object.defineProperty(navigator, "clipboard", { configurable: true, value });
  const status = () => document.querySelector('[role="status"]')?.textContent;

  const writeText = mock.fn(async () => {});
  clipboard({ writeText });
  await mount(<CopyButton code="pnpm dlx shadcn@latest add @abnormal/button" />);
  await click(button("Copy"));
  assert.deepEqual(writeText.mock.calls[0]?.arguments, ["pnpm dlx shadcn@latest add @abnormal/button"]);
  assert.equal(status(), "Copied");
  await mounted.pop()!.unmount();

  for (const unavailable of [{ writeText: async () => Promise.reject(new Error("Denied")) }, undefined]) {
    clipboard(unavailable);
    await mount(<CopyButton code="x" />);
    await click(button("Copy"));
    assert.ok(button("Copy failed"));
    assert.equal(status(), "Copy failed");
    await mounted.pop()!.unmount();
  }
});
