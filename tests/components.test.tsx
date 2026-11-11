// The browser environment has to come first: see support/dom.ts.
import { click, render } from "./support/render.tsx";
import assert from "node:assert/strict";
import { afterEach, mock, test } from "node:test";
import { act, useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmButton, ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { GuardedDialog } from "@/components/ui/guarded-dialog";
import { InfoHint } from "@/components/ui/info-hint";
import { LinkRow } from "@/components/ui/link-row";
import { Progress } from "@/components/ui/progress";
import { SearchInput } from "@/components/ui/search-input";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { rowClickHandler } from "@/components/ui/table-row";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useOpenCount } from "@/components/ui/use-open-count";
import { CopyButton } from "@/components/ui/copy-button";

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

test("a loading Button stops activation, as a link too, and lets it through again when done", async () => {
  const onClick = mock.fn();
  const { container, rerender } = await mount(
    <Button asChild loading>
      <a href="#next" onClick={onClick}>
        Continue
      </a>
    </Button>,
  );
  const link = container.querySelector("a")!;
  assert.equal(link.getAttribute("aria-disabled"), "true");
  const blocked = new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 });
  await act(async () => void link.dispatchEvent(blocked));
  assert.equal(onClick.mock.callCount(), 0);
  assert.equal(blocked.defaultPrevented, true);

  await rerender(
    <Button asChild>
      <a href="#next" onClick={onClick}>
        Continue
      </a>
    </Button>,
  );
  await click(container.querySelector("a")!);
  assert.equal(onClick.mock.callCount(), 1);
});

test("a disabled asChild Button is aria-disabled and stops activation, like a loading one", async () => {
  const onClick = mock.fn();
  const link = (disabled: boolean) => (
    <Button asChild disabled={disabled}>
      <a href="#next" onClick={onClick}>
        Continue
      </a>
    </Button>
  );
  const { container, rerender } = await mount(link(true));
  const anchor = container.querySelector("a")!;
  assert.equal(anchor.getAttribute("aria-disabled"), "true");
  // Not busy: nothing is in progress, so no spinner either.
  assert.equal(anchor.getAttribute("aria-busy"), null);
  assert.equal(anchor.querySelector('[data-slot="spinner"]'), null);
  const blocked = new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 });
  await act(async () => void anchor.dispatchEvent(blocked));
  assert.equal(onClick.mock.callCount(), 0);
  assert.equal(blocked.defaultPrevented, true);

  await rerender(link(false));
  assert.equal(container.querySelector("a")!.getAttribute("aria-disabled"), null);
  await click(container.querySelector("a")!);
  assert.equal(onClick.mock.callCount(), 1);

  // A native button is disabled by the attribute alone.
  await rerender(<Button disabled>Save</Button>);
  assert.equal(button("Save").disabled, true);
  assert.equal(button("Save").getAttribute("aria-disabled"), null);
});

test("an InfoHint toggles on every tap or click, and on Enter", async () => {
  await mount(<InfoHint label="About quotas">Resets on the 1st</InfoHint>);
  const hint = button("About quotas");
  const shown = () => (document.body.textContent ?? "").includes("Resets on the 1st");
  // A press the way a browser sends it: pointerdown, focus, pointerup, then a click that counts one press.
  const tap = async () => {
    await act(async () => {
      hint.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true, pointerType: "touch" }));
      hint.focus();
      hint.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, cancelable: true, pointerType: "touch" }));
    });
    await click(hint, { detail: 1 });
  };

  assert.equal(shown(), false);
  for (const expected of [true, false, true, false]) {
    await tap();
    assert.equal(shown(), expected);
  }

  // Enter and Space arrive as a click with no press behind it.
  for (const expected of [true, false, true]) {
    await click(hint);
    assert.equal(shown(), expected);
  }
});

test("a Progress bar scales to its max, and sweeps without a value", async () => {
  const { container, rerender } = await mount(<Progress value={50} max={200} aria-label="Import" />);
  const bar = () => container.querySelector<HTMLElement>('[data-slot="progress-indicator"]')!;
  assert.equal(bar().style.transform, "translateX(-75%)");
  assert.equal(container.querySelector('[role="progressbar"]')?.getAttribute("aria-valuemax"), "200");
  await rerender(<Progress aria-label="Import" />);
  assert.match(bar().className, /animate-progress-sweep/);
});

test("a LinkRow runs the row's own onClick first and stays put when it prevents the default", async () => {
  const navigate = mock.fn();
  const clicks: boolean[] = [];
  await mount(
    <Table>
      <TableBody>
        <LinkRow href="/one" navigate={navigate}>
          <TableCell>one</TableCell>
        </LinkRow>
        <LinkRow
          href="/two"
          navigate={navigate}
          onClick={(event) => {
            clicks.push(true);
            event.preventDefault();
          }}
        >
          <TableCell>two</TableCell>
        </LinkRow>
      </TableBody>
    </Table>,
  );
  const cell = (text: string) => [...document.querySelectorAll("td")].find((td) => td.textContent === text)!;
  await click(cell("one"));
  assert.deepEqual(
    navigate.mock.calls.map(({ arguments: args }) => args),
    [["/one"]],
  );
  await click(cell("two"));
  assert.deepEqual(clicks, [true]);
  assert.equal(navigate.mock.callCount(), 1);
});

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

test("a form reset puts an uncontrolled Switch back to its default, and its form data with it", async () => {
  const onCheckedChange = mock.fn();
  const settings = (digestDefault: boolean) => (
    <>
      <form id="settings">
        <Switch
          name="digest"
          defaultChecked={digestDefault}
          onCheckedChange={onCheckedChange}
          aria-label="Weekly digest"
        />
        <Switch name="notify" checked onCheckedChange={() => {}} aria-label="Notify" />
      </form>
      {/* Outside the form, joined to it by the form attribute. */}
      <Switch form="settings" name="sms" aria-label="Text messages" />
    </>
  );
  const { container, rerender } = await mount(settings(false));
  const form = container.querySelector("form")!;
  const names = ["Weekly digest", "Notify", "Text messages"];
  const shown = () => names.map((name) => button(name).getAttribute("aria-checked"));
  const submitted = () => [...new FormData(form).keys()];

  await click(button("Weekly digest"));
  await click(button("Text messages"));
  assert.deepEqual(shown(), ["true", "true", "true"]);
  assert.deepEqual(submitted(), ["digest", "notify", "sms"]);

  // Like a checkbox, an uncontrolled switch goes back to its default without a change event; the controlled one
  // keeps what its owner says. Either way the form submits what the switch shows.
  await act(async () => form.reset());
  assert.deepEqual(shown(), ["false", "true", "false"]);
  assert.deepEqual(submitted(), ["notify"]);
  assert.equal(onCheckedChange.mock.callCount(), 1);

  // An untouched switch follows a new default, as a checkbox follows its checked attribute, so a reset lands on the
  // default the page renders now.
  await rerender(settings(true));
  assert.deepEqual(shown(), ["true", "true", "false"]);
  await click(button("Weekly digest"));
  assert.deepEqual(submitted(), ["notify"]);
  await act(async () => form.reset());
  assert.deepEqual(shown(), ["true", "true", "false"]);
  assert.deepEqual(submitted(), ["digest", "notify"]);
});

test("a cancelled form reset leaves a Switch alone, as a browser leaves a checkbox", async () => {
  const settings = (cancel: boolean) => (
    <form
      onReset={(event) => {
        if (cancel) event.preventDefault();
      }}
    >
      <Switch name="digest" aria-label="Weekly digest" />
      <Switch name="sms" defaultChecked aria-label="Text messages" />
      <button type="reset">Reset</button>
    </form>
  );
  const { container, rerender } = await mount(settings(true));
  const form = container.querySelector("form")!;
  const submitted = () => [...new FormData(form).keys()];
  // A task later: the switch must not move once the event is over either.
  const later = () => act(async () => void (await new Promise((resolve) => setTimeout(resolve))));

  // Only switches here: happy-dom resets native fields before it dispatches the event, cancelled or not.
  await click(button("Weekly digest"));
  await click(button("Text messages"));
  assert.deepEqual(submitted(), ["digest"]);

  // The page says no in React's onReset, which runs at the root, after the listeners on the form itself.
  await act(async () => form.reset());
  await later();
  assert.equal(button("Weekly digest").getAttribute("aria-checked"), "true");
  assert.deepEqual(submitted(), ["digest"]);
  await click(button("Reset"));
  await later();
  assert.equal(button("Weekly digest").getAttribute("aria-checked"), "true");
  assert.deepEqual(submitted(), ["digest"]);
  // A listener outside React that cancels it counts the same.
  const refuse = (event: Event) => event.preventDefault();
  await rerender(settings(false));
  document.addEventListener("reset", refuse);
  await click(button("Reset"));
  await later();
  document.removeEventListener("reset", refuse);
  assert.deepEqual(submitted(), ["digest"]);

  // A reset that goes through takes both back to their defaults.
  await click(button("Reset"));
  assert.equal(button("Weekly digest").getAttribute("aria-checked"), "false");
  assert.deepEqual(submitted(), ["sms"]);
});

test("a Switch still submits what it shows after React resets the form of a finished action", async () => {
  const submitted: (string | null)[] = [];
  function Settings() {
    // The saved value comes back as the new default, the way a Server Action's revalidated page would bring it.
    const [saved, setSaved] = useState(false);
    return (
      <form
        action={async (data) => {
          submitted.push(data.get("digest") as string | null);
          setSaved(data.get("digest") === "on");
        }}
      >
        <Switch name="digest" defaultChecked={saved} aria-label="Weekly digest" />
        <input name="note" defaultValue="" aria-label="Note" />
        <button type="submit">Save</button>
      </form>
    );
  }
  const { container } = await mount(<Settings />);
  const form = container.querySelector("form")!;
  const submit = () => act(async () => form.requestSubmit(button("Save")));

  await click(button("Weekly digest"));
  await submit();
  assert.equal(button("Weekly digest").getAttribute("aria-checked"), "true");
  assert.equal(new FormData(form).get("digest"), "on");

  // Editing another field and saving again keeps the switch on.
  container.querySelector<HTMLInputElement>('[name="note"]')!.value = "Mondays";
  await submit();
  assert.deepEqual(submitted, ["on", "on"]);
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

test("a Table's container takes keyboard focus only while it scrolls, and is a region when the table is named", async () => {
  const table = (label?: string) => (
    <Table aria-label={label}>
      <TableBody>
        <TableRow>
          <TableCell>wide</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
  const { container, rerender } = await mount(table());
  const scroller = container.querySelector<HTMLElement>('[data-slot="table-container"]')!;
  const layout = { clientWidth: 300, scrollWidth: 300, clientHeight: 200, scrollHeight: 200 };
  for (const key of Object.keys(layout) as (keyof typeof layout)[]) {
    Object.defineProperty(scroller, key, { configurable: true, get: () => layout[key] });
  }
  const scroll = () => act(async () => void scroller.dispatchEvent(new Event("scroll")));

  // A table that fits adds no tab stop.
  await scroll();
  assert.equal(scroller.getAttribute("tabindex"), null);
  assert.equal(scroller.getAttribute("role"), null);

  layout.scrollWidth = 800;
  await scroll();
  assert.equal(scroller.getAttribute("tabindex"), "0");
  // No name was given, and the component has no words of its own to make one from.
  assert.equal(scroller.getAttribute("role"), null);
  assert.equal(scroller.getAttribute("aria-label"), null);

  await rerender(table("Mailboxes"));
  assert.equal(scroller.getAttribute("role"), "region");
  assert.equal(scroller.getAttribute("aria-label"), "Mailboxes");
  assert.equal(container.querySelector("table")!.getAttribute("aria-label"), "Mailboxes");

  // A height-limited container scrolls down instead.
  Object.assign(layout, { scrollWidth: 300, scrollHeight: 900 });
  await scroll();
  assert.equal(scroller.getAttribute("tabindex"), "0");
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

const copy = (text: string) => <CopyButton text={text} label="Copy" copiedLabel="Copied" failedLabel="Copy failed" />;

test("the copy button reports a failed copy instead of throwing", async () => {
  const clipboard = (value: unknown) => Object.defineProperty(navigator, "clipboard", { configurable: true, value });
  const status = () => document.querySelector('[role="status"]')?.textContent;

  const writeText = mock.fn(async () => {});
  clipboard({ writeText });
  await mount(copy("pnpm dlx shadcn@latest add @abnormal/button"));
  await click(button("Copy"));
  assert.deepEqual(writeText.mock.calls[0]?.arguments, ["pnpm dlx shadcn@latest add @abnormal/button"]);
  assert.equal(status(), "Copied");
  await mounted.pop()!.unmount();

  for (const unavailable of [{ writeText: async () => Promise.reject(new Error("Denied")) }, undefined]) {
    clipboard(unavailable);
    await mount(copy("x"));
    await click(button("Copy"));
    assert.equal(status(), "Copy failed");
    // The outcome is announced once, by the status message; the focused button keeps its name.
    assert.ok(button("Copy"));
    assert.equal(document.querySelector("button svg")?.getAttribute("class")?.includes("lucide-x"), true);
    await mounted.pop()!.unmount();
  }
});

test("the copy button does nothing when a copy settles after it has gone", async () => {
  let settle = () => {};
  const writeText = () => new Promise<void>((resolve) => (settle = resolve));
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
  await mount(copy("x"));
  await click(button("Copy"));
  await mounted.pop()!.unmount();

  const setTimeout = mock.method(globalThis, "setTimeout");
  await act(async () => settle());
  assert.equal(setTimeout.mock.calls.filter(({ arguments: [, delay] }) => delay === 1500).length, 0);
});

/** Escape, the way a keyboard sends it: Radix listens on the document. */
const pressEscape = () =>
  act(async () => {
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
  });

/** A press on the overlay. Radix starts listening for outside presses a tick after the dialog mounts. */
const pressOutside = async () => {
  await act(async () => void (await new Promise((resolve) => setTimeout(resolve, 0))));
  const overlay = document.querySelector('[data-slot="dialog-overlay"], [data-slot="alert-dialog-overlay"]');
  assert.ok(overlay, "an overlay");
  await act(async () => {
    overlay.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true, button: 0 }));
  });
};

test("a GuardedDialog closes by Escape, an outside press and its close button, but not while pending", async () => {
  const onOpenChange = mock.fn();
  const dialog = (pending: boolean) => (
    <GuardedDialog open onOpenChange={onOpenChange} pending={pending} closeLabel="Close">
      <DialogTitle>Rename mailbox</DialogTitle>
      <DialogDescription>The old name bounces.</DialogDescription>
    </GuardedDialog>
  );
  const asked = () => onOpenChange.mock.calls.map(({ arguments: args }) => args[0]);
  const { rerender } = await mount(dialog(false));

  // Each way out works while idle, so the silence below is the guard's doing.
  await pressEscape();
  await pressOutside();
  await click(button("Close"));
  assert.deepEqual(asked(), [false, false, false]);

  await rerender(dialog(true));
  await pressEscape();
  await pressOutside();
  assert.equal(
    [...document.querySelectorAll("button")].some((element) => element.getAttribute("aria-label") === "Close"),
    false,
  );
  assert.equal(asked().length, 3);
  assert.match(document.body.textContent ?? "", /Rename mailbox/);
});

const confirmProps = {
  title: "Delete mailbox?",
  description: "Its mail goes with it.",
  confirmLabel: "Delete",
  cancelLabel: "Keep",
};

test("a ConfirmDialog without pending closes itself on confirm and on cancel", async () => {
  const onOpenChange = mock.fn();
  const onConfirm = mock.fn();
  await mount(<ConfirmDialog open onOpenChange={onOpenChange} onConfirm={onConfirm} {...confirmProps} />);
  const asked = () => onOpenChange.mock.calls.map(({ arguments: args }) => args[0]);

  await click(button("Delete"));
  assert.equal(onConfirm.mock.callCount(), 1);
  assert.deepEqual(asked(), [false]);
  await click(button("Keep"));
  assert.equal(onConfirm.mock.callCount(), 1);
  assert.deepEqual(asked(), [false, false]);
});

test("a ConfirmDialog given pending leaves closing to its caller, and cannot be closed while pending", async () => {
  const onOpenChange = mock.fn();
  const onConfirm = mock.fn();
  const dialog = (pending: boolean) => (
    <ConfirmDialog open onOpenChange={onOpenChange} onConfirm={onConfirm} pending={pending} {...confirmProps} />
  );
  const { rerender } = await mount(dialog(false));

  // Confirming starts the work and the dialog stays for it.
  await click(button("Delete"));
  assert.equal(onConfirm.mock.callCount(), 1);
  assert.equal(onOpenChange.mock.callCount(), 0);

  await rerender(dialog(true));
  assert.equal(button("Delete").disabled, true);
  assert.equal(button("Delete").getAttribute("aria-busy"), "true");
  assert.equal(button("Keep").disabled, true);
  await click(button("Delete"));
  await click(button("Keep"));
  await pressEscape();
  assert.equal(onConfirm.mock.callCount(), 1);
  assert.equal(onOpenChange.mock.callCount(), 0);

  // Done: the caller may close it, and so may the user.
  await rerender(dialog(false));
  await click(button("Keep"));
  assert.deepEqual(
    onOpenChange.mock.calls.map(({ arguments: args }) => args[0]),
    [false],
  );
});

test("a ConfirmButton asks first, and runs the action only on confirm", async () => {
  const onConfirm = mock.fn();
  await mount(
    <ConfirmButton onConfirm={onConfirm} buttonLabel="Delete mailbox" {...confirmProps}>
      ×
    </ConfirmButton>,
  );
  const asking = () => (document.body.textContent ?? "").includes("Delete mailbox?");
  assert.equal(asking(), false);

  await click(button("Delete mailbox"));
  assert.equal(asking(), true);
  await click(button("Keep"));
  assert.equal(asking(), false);
  assert.equal(onConfirm.mock.callCount(), 0);

  await click(button("Delete mailbox"));
  await click(button("Delete"));
  assert.equal(onConfirm.mock.callCount(), 1);
  assert.equal(asking(), false);
});

test("useOpenCount counts opens, not closes or re-renders", async () => {
  const counts: number[] = [];
  function Probe({ open }: { open: boolean }) {
    counts.push(useOpenCount(open));
    return null;
  }
  const { rerender } = await mount(<Probe open={false} />);
  const last = () => counts.at(-1);
  assert.equal(last(), 0);
  await rerender(<Probe open />);
  assert.equal(last(), 1);
  await rerender(<Probe open />);
  assert.equal(last(), 1);
  await rerender(<Probe open={false} />);
  assert.equal(last(), 1);
  await rerender(<Probe open />);
  assert.equal(last(), 2);

  // A dialog that mounts open has not been opened again: its form is already fresh.
  await mount(<Probe open />);
  assert.equal(last(), 0);
});

test("the search input's clear button empties the box as typing would, and gives way to the hint", async () => {
  const onChange = mock.fn();
  const onClear = mock.fn();
  function Search() {
    const [query, setQuery] = useState("abnormalhq.com");
    return (
      <SearchInput
        aria-label="Search domains"
        clearLabel="Clear"
        hint={<kbd>/</kbd>}
        value={query}
        onChange={(event) => {
          onChange(event.target.value);
          setQuery(event.target.value);
        }}
        onClear={onClear}
      />
    );
  }
  const { container } = await mount(<Search />);
  const input = container.querySelector("input")!;
  assert.equal(input.type, "search");
  assert.equal(container.querySelector("kbd"), null);

  await click(button("Clear"));
  assert.deepEqual(onChange.mock.calls[0]?.arguments, [""]);
  assert.equal(onClear.mock.callCount(), 1);
  assert.equal(input.value, "");
  assert.equal(document.activeElement, input);
  // An empty box has nothing to clear: the hint takes the corner.
  assert.equal(container.querySelector("button"), null);
  assert.equal(container.querySelector("kbd")?.textContent, "/");
});

test("an uncontrolled search input shows its clear button once it holds text, and not while disabled", async () => {
  const { container, rerender } = await mount(<SearchInput aria-label="Search" clearLabel="Clear" />);
  const input = container.querySelector("input")!;
  assert.equal(container.querySelector("button"), null);

  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, "ada");
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  assert.ok(button("Clear"));

  await rerender(<SearchInput aria-label="Search" clearLabel="Clear" disabled />);
  assert.equal(container.querySelector("button"), null);

  await rerender(<SearchInput aria-label="Search" clearLabel="Clear" />);
  await click(button("Clear"));
  assert.equal(input.value, "");
  assert.equal(container.querySelector("button"), null);
});

test("a form reset puts an uncontrolled search input's clear button back in step with its text", async () => {
  const { container } = await mount(
    <form>
      <SearchInput aria-label="Search" clearLabel="Clear" defaultValue="ada" />
    </form>,
  );
  await click(button("Clear"));
  assert.equal(container.querySelector("button"), null);

  await act(async () => {
    container.querySelector("form")!.reset();
    await new Promise((resolve) => setTimeout(resolve));
  });
  assert.equal(container.querySelector("input")!.value, "ada");
  assert.ok(button("Clear"));
});

test("the search input attaches the caller's ref once, not on every keystroke", async () => {
  const ref = mock.fn();
  function Search() {
    const [query, setQuery] = useState("");
    return (
      <SearchInput
        ref={ref}
        aria-label="Search"
        clearLabel="Clear"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
    );
  }
  const { container } = await mount(<Search />);
  const input = container.querySelector("input")!;
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, "ada");
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  assert.equal(input.value, "ada");
  assert.deepEqual(
    ref.mock.calls.map(({ arguments: [element] }) => element),
    [input],
  );
});
