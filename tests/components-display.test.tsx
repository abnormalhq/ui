// The browser environment has to come first: see support/dom.ts.
import { click, render } from "./support/render.tsx";
import assert from "node:assert/strict";
import { afterEach, mock, test } from "node:test";
import * as React from "react";
import { act, useState } from "react";
import { Input } from "@/components/ui/input";
import { CodeBlock } from "@/components/ui/code-block";
import { CopyButton } from "@/components/ui/copy-button";
import { ExpandableText } from "@/components/ui/expandable-text";
import { Field, FieldControl, FieldHint, FieldLabel, SwitchField } from "@/components/ui/field";
import { Progress } from "@/components/ui/progress";
import { SelectionBar } from "@/components/ui/selection-bar";
import { Tag, TagList } from "@/components/ui/tag";
import { TruncatedText } from "@/components/ui/truncated-text";
import { IconButton } from "@/components/ui/icon-button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SortableHead } from "@/components/ui/table";
import { Toolbar, ToolbarButton } from "@/components/ui/toolbar";
import { LabelTooltip, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

/** Makes every element of a kind report a box smaller than its content, as a cut-off one does in a browser. */
function overflowing(axis: "width" | "height", value: boolean) {
  const [scroll, client] = axis === "width" ? ["scrollWidth", "clientWidth"] : ["scrollHeight", "clientHeight"];
  mock.getter(HTMLElement.prototype, scroll as "scrollWidth", () => (value ? 200 : 100));
  mock.getter(HTMLElement.prototype, client as "clientWidth", () => 100);
}

test("a Field ties its label, control and hint together, and the error takes the hint's place", async () => {
  const { container, rerender } = await mount(
    <Field>
      <FieldLabel>Address</FieldLabel>
      <FieldControl>
        <Input name="address" aria-describedby="rules" />
      </FieldControl>
      <FieldHint>Letters and dots.</FieldHint>
    </Field>,
  );
  const input = container.querySelector("input")!;
  const label = container.querySelector("label")!;
  const hint = () => container.querySelector<HTMLElement>('[data-slot="field-message"]')!;
  assert.ok(input.id);
  assert.equal(label.htmlFor, input.id);
  // The control's own describedby stays, and the hint joins it.
  assert.deepEqual(input.getAttribute("aria-describedby")?.split(" "), ["rules", hint().id]);
  assert.equal(input.hasAttribute("aria-invalid"), false);
  assert.equal(input.dataset.slot, "input", "the control keeps its own slot");
  assert.equal(hint().textContent, "Letters and dots.");

  await rerender(
    <Field error="Already taken." id="address">
      <FieldLabel>Address</FieldLabel>
      <FieldControl>
        <Input name="address" />
      </FieldControl>
      <FieldHint>Letters and dots.</FieldHint>
    </Field>,
  );
  assert.equal(input.id, "address", "the control's id comes from the Field");
  assert.equal(input.getAttribute("aria-invalid"), "true");
  assert.equal(input.getAttribute("aria-describedby"), hint().id);
  assert.equal(hint().textContent, "Already taken.");
  assert.equal(hint().getAttribute("role"), "alert");
  assert.equal(container.querySelector('[data-slot="field"]')?.hasAttribute("data-invalid"), true);
});

test("a SwitchField's name labels the switch and its line describes it, and a click on the name toggles it", async () => {
  const onCheckedChange = mock.fn();
  const { container } = await mount(
    <SwitchField label="Weekly digest" description="Every Monday." onCheckedChange={onCheckedChange} />,
  );
  const control = container.querySelector<HTMLButtonElement>('[role="switch"]')!;
  const label = container.querySelector("label")!;
  assert.equal(label.htmlFor, control.id);
  assert.equal(document.getElementById(control.getAttribute("aria-describedby")!)?.textContent, "Every Monday.");
  await click(label);
  assert.equal(control.getAttribute("aria-checked"), "true");
  assert.deepEqual(onCheckedChange.mock.calls[0]?.arguments, [true]);
});

test("a disabled SwitchField disables its switch", async () => {
  const { container } = await mount(<SwitchField label="Weekly digest" disabled />);
  assert.equal(container.querySelector<HTMLButtonElement>('[role="switch"]')!.disabled, true);
});

function Selection({ total = 3, onClear }: { total?: number; onClear?: () => void }) {
  const [selected, setSelected] = useState(0);
  return (
    <>
      <SelectionBar
        label="Selected messages"
        selectAllLabel="Select all"
        selected={selected}
        total={total}
        onSelectAll={(all) => setSelected(all ? total : 0)}
        count={`${selected} selected`}
        clearLabel="Clear selection"
        onClear={() => {
          onClear?.();
          setSelected(0);
        }}
      >
        <button type="button">Archive</button>
      </SelectionBar>
      <button type="button" onClick={() => setSelected(1)}>
        Check one
      </button>
    </>
  );
}

test("a SelectionBar is a named toolbar whose checkbox shows none, some and all, and checks or clears every row", async () => {
  const onClear = mock.fn();
  const { container } = await mount(<Selection onClear={onClear} />);
  const toolbar = container.querySelector('[role="toolbar"]')!;
  assert.equal(toolbar.getAttribute("aria-label"), "Selected messages");
  const checkbox = () => container.querySelector('[role="checkbox"]')!;
  const status = () => container.querySelector('[role="status"]')!.textContent;
  assert.equal(checkbox().getAttribute("aria-checked"), "false");
  assert.equal(status(), "");
  // The actions and the clear button wait until something is checked.
  assert.equal(toolbar.textContent?.includes("Archive"), false);

  await click(button("Check one"));
  assert.equal(checkbox().getAttribute("aria-checked"), "mixed");
  assert.equal(status(), "1 selected");
  assert.ok(button("Archive"));

  // Some checked: the checkbox checks every row.
  await click(checkbox());
  assert.equal(checkbox().getAttribute("aria-checked"), "true");
  assert.equal(status(), "3 selected");

  await click(button("Clear selection"));
  assert.equal(onClear.mock.callCount(), 1);
  assert.equal(checkbox().getAttribute("aria-checked"), "false");
});

test("a SelectionBar over an empty list cannot be checked", async () => {
  const { container } = await mount(<Selection total={0} />);
  assert.equal(container.querySelector<HTMLButtonElement>('[role="checkbox"]')!.disabled, true);
});

test("a disabled SelectionBar disables its actions too, links included, and its clear button", async () => {
  const { container } = await mount(
    <SelectionBar
      label="Selected messages"
      selectAllLabel="Select all"
      selected={1}
      total={3}
      onSelectAll={() => {}}
      count="1 selected"
      clearLabel="Clear selection"
      onClear={() => {}}
      disabled
    >
      <button type="button">Archive</button>
      <a href="#export">Export</a>
    </SelectionBar>,
  );
  const actions = container.querySelector<HTMLFieldSetElement>('[data-slot="selection-bar-actions"]')!;
  assert.equal(actions.tagName, "FIELDSET");
  assert.equal(actions.disabled, true);
  assert.equal(actions.hasAttribute("inert"), true);
  // A browser disables every control in a disabled fieldset, and inert stops the link; happy-dom models neither, so the
  // markup is what is checked here.
  assert.equal(button("Archive").closest("fieldset"), actions);
  assert.equal(container.querySelector<HTMLButtonElement>('[role="checkbox"]')!.disabled, true);
  assert.equal(button("Clear selection").hasAttribute("disabled"), true);
  assert.equal(container.querySelector('a[href="#export"]')?.closest("fieldset"), actions);
});

test("a Tag's remove button carries the name it is given, and a Tag without onRemove has none", async () => {
  const onRemove = mock.fn();
  const { container } = await mount(
    <TagList aria-label="Domains">
      <li>
        <Tag removeLabel="Remove example.com" onRemove={onRemove}>
          example.com
        </Tag>
      </li>
      <li>
        <Tag>example.org</Tag>
      </li>
    </TagList>,
  );
  await click(button("Remove example.com"));
  assert.equal(onRemove.mock.callCount(), 1);
  assert.equal(container.querySelectorAll("button").length, 1);
});

test("an ExpandableText offers its button only when the text runs past its lines, and says whether it is open", async () => {
  // happy-dom lays nothing out, and its ResizeObserver never reports: one that reports at once stands in.
  const original = globalThis.ResizeObserver;
  globalThis.ResizeObserver = class {
    constructor(private callback: ResizeObserverCallback) {}
    observe() {
      this.callback([], this);
    }
    unobserve() {}
    disconnect() {}
  };
  try {
    overflowing("height", false);
    const short = await mount(
      <ExpandableText moreLabel="Show more" lessLabel="Show less">
        Short.
      </ExpandableText>,
    );
    assert.equal(short.container.querySelector("button"), null);
    mock.restoreAll();

    overflowing("height", true);
    const { container } = await mount(
      <ExpandableText lines={2} moreLabel="Show more" lessLabel="Show less">
        A long message.
      </ExpandableText>,
    );
    const more = button("Show more");
    const region = document.getElementById(more.getAttribute("aria-controls")!)!;
    assert.equal(more.getAttribute("aria-expanded"), "false");
    assert.match(region.className, /line-clamp-\(--lines\)/);
    assert.equal(region.style.getPropertyValue("--lines"), "2");
    await click(more);
    assert.equal(button("Show less").getAttribute("aria-expanded"), "true");
    assert.doesNotMatch(region.className, /line-clamp/);
    assert.ok(container.contains(region));
  } finally {
    globalThis.ResizeObserver = original;
  }
});

test("a TruncatedText shows its tooltip only when the text was cut", async () => {
  const hover = async (element: Element) => {
    await act(async () => {
      element.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, pointerType: "mouse" }));
    });
    // The tooltip opens after its delay.
    await act(async () => new Promise((resolve) => setTimeout(resolve, 350)));
  };
  const tooltip = () => document.querySelector('[data-slot="tooltip-content"]');

  overflowing("width", false);
  const fits = await mount(<TruncatedText text="Short subject" />);
  await hover(fits.container.querySelector('[data-slot="truncated-text"]')!);
  assert.equal(tooltip(), null);
  await mounted.pop()!.unmount();
  mock.restoreAll();

  overflowing("width", true);
  const cut = await mount(<TruncatedText text="A subject far too long for its column" />);
  await hover(cut.container.querySelector('[data-slot="truncated-text"]')!);
  assert.equal(tooltip()?.textContent?.includes("A subject far too long for its column"), true);
});

test("a CodeBlock's copy button copies its code, and its title names the block", async () => {
  const writeText = mock.fn(async () => {});
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
  const { container } = await mount(
    <CodeBlock title="Terminal" action={<CopyButton label="Copy" copiedLabel="Copied" failedLabel="Copy failed" />}>
      brew install mail
    </CodeBlock>,
  );
  const pre = container.querySelector("pre")!;
  assert.equal(pre.getAttribute("role"), "region");
  assert.equal(document.getElementById(pre.getAttribute("aria-labelledby")!)?.textContent, "Terminal");
  await click(button("Copy"));
  assert.deepEqual(writeText.mock.calls[0]?.arguments, ["brew install mail"]);
});

test("a Progress bar takes the tone of a meter near or at its limit", async () => {
  const { container, rerender } = await mount(<Progress value={50} aria-label="Storage" />);
  const bar = () => container.querySelector<HTMLElement>('[data-slot="progress-indicator"]')!;
  assert.match(bar().className, /bg-signal/);
  await rerender(<Progress value={90} tone="warning" aria-label="Storage" />);
  assert.match(bar().className, /bg-warning/);
  await rerender(<Progress value={100} tone="destructive" aria-label="Storage" />);
  assert.match(bar().className, /bg-destructive/);
});

test("a Progress bar that stopped or finished turns grey with tone=muted, and keeps its value", async () => {
  const { container } = await mount(<Progress value={40} tone="muted" aria-label="Search" />);
  const root = container.querySelector<HTMLElement>('[data-slot="progress"]')!;
  const bar = container.querySelector<HTMLElement>('[data-slot="progress-indicator"]')!;
  assert.equal(root.dataset.tone, "muted");
  assert.match(bar.className, /bg-muted-foreground/);
  assert.doesNotMatch(bar.className, /bg-signal/);
  assert.equal(bar.style.transform, "translateX(-60%)");
});

test("a SelectionBar without onSelectAll has no checkbox, and keeps its count, actions and clear button", async () => {
  const onClear = mock.fn();
  const bar = (selected: number) => (
    <SelectionBar
      label="Selected mailboxes"
      selected={selected}
      count={`${selected} selected`}
      idle="Filters"
      clearLabel="Clear selection"
      onClear={onClear}
    >
      <button type="button">Suspend</button>
    </SelectionBar>
  );
  const { container, rerender } = await mount(bar(0));
  assert.equal(container.querySelector('[role="checkbox"]'), null);
  assert.equal(container.querySelector('[data-slot="selection-bar-idle"]')?.textContent, "Filters");

  await rerender(bar(2));
  assert.equal(container.querySelector('[role="checkbox"]'), null);
  assert.equal(container.querySelector('[role="status"]')?.textContent, "2 selected");
  assert.ok(button("Suspend"));
  await click(button("Clear selection"));
  assert.equal(onClear.mock.callCount(), 1);
});

test("an IconButton shows its label as the theme's tooltip, in a portal, without repeating it as a description", async () => {
  const hover = async (element: Element) => {
    await act(async () => {
      element.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, pointerType: "mouse" }));
    });
    await act(async () => new Promise((resolve) => setTimeout(resolve, 350)));
  };
  const { container } = await mount(
    <IconButton label="Archive" onClick={() => {}}>
      <svg aria-hidden="true" />
    </IconButton>,
  );
  const button = container.querySelector("button")!;
  assert.equal(button.getAttribute("aria-label"), "Archive");
  assert.equal(button.hasAttribute("title"), false);
  assert.equal(button.getAttribute("data-size"), "icon");
  await hover(button);
  const content = document.querySelector('[data-slot="tooltip-content"]');
  assert.equal(content?.textContent?.includes("Archive"), true);
  // Portaled out of the button's own box, so no scrolling parent clips it.
  assert.equal(container.contains(content), false);
  assert.equal(button.hasAttribute("aria-describedby"), false);
});

test("a LabelTooltip describes its child when it adds words, and opens on Tab but not on a script's focus", async () => {
  const { container } = await mount(
    <LabelTooltip label="Archive (E)">
      <button type="button" aria-label="Archive">
        <svg aria-hidden="true" />
      </button>
    </LabelTooltip>,
  );
  const button = container.querySelector("button")!;
  const content = () => document.querySelector('[data-slot="tooltip-content"]');
  // Focus moved by a script, as a dialog does when it opens or a menu when it closes, opens nothing.
  await act(async () => {
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    button.focus();
  });
  assert.equal(content(), null);
  await act(async () => button.blur());
  await act(async () => {
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
    button.focus();
  });
  assert.equal(content()?.textContent?.includes("Archive (E)"), true);
  assert.ok(button.getAttribute("aria-describedby"));
});

test("a LabelTooltip with no label, or inside a TooltipTrigger, adds nothing", async () => {
  const { container } = await mount(
    <>
      <LabelTooltip label={undefined}>
        <span data-testid="plain">Plain</span>
      </LabelTooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <IconButton label="Inner">
            <svg aria-hidden="true" />
          </IconButton>
        </TooltipTrigger>
        <TooltipContent>Outer</TooltipContent>
      </Tooltip>
    </>,
  );
  assert.equal(container.querySelector('[data-testid="plain"]')?.hasAttribute("data-state"), false);
  // One trigger: the outer one's data-state, not a second tooltip of the IconButton's own.
  assert.equal(container.querySelectorAll("[data-state]").length, 1);
});

test("a LabelTooltip around a disabled button still opens, from a box around it", async () => {
  const { container } = await mount(
    <LabelTooltip label="Generate the shots first">
      <button type="button" disabled>
        Export
      </button>
    </LabelTooltip>,
  );
  const box = container.querySelector('[data-slot="tooltip-disabled-trigger"]')!;
  assert.ok(box.contains(container.querySelector("button")));
  await act(async () => {
    box.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, pointerType: "mouse" }));
  });
  await act(async () => new Promise((resolve) => setTimeout(resolve, 350)));
  assert.equal(
    document.querySelector('[data-slot="tooltip-content"]')?.textContent?.includes("Generate the shots first"),
    true,
  );
});

test("a LabelTooltip inside a trigger's asChild passes the trigger's click and ref on to its child", async () => {
  const { container } = await mount(
    <Dialog>
      <DialogTrigger asChild>
        <LabelTooltip label="New mailbox">
          <button type="button">New</button>
        </LabelTooltip>
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogTitle>New mailbox</DialogTitle>
      </DialogContent>
    </Dialog>,
  );
  const button = container.querySelector("button")!;
  assert.equal(button.getAttribute("aria-haspopup"), "dialog");
  await click(button);
  assert.ok(document.querySelector('[data-slot="dialog-content"]'));
  // The dialog hands focus back through the trigger's ref, which only reaches the button if the tooltip passed it on.
  await act(async () => {
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  });
  await act(async () => new Promise((resolve) => setTimeout(resolve, 50)));
  assert.equal(document.querySelector('[data-slot="dialog-content"]'), null);
  assert.equal(document.activeElement, button);
});

const hover = async (element: Element) => {
  await act(async () => {
    element.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, pointerType: "mouse" }));
  });
  await act(async () => new Promise((resolve) => setTimeout(resolve, 350)));
};

test("a disabled child's tooltip describes the child, not the box it listens on, unless told not to", async () => {
  const { container } = await mount(
    <>
      <LabelTooltip label="Generate the shots first">
        <button type="button" disabled data-testid="export">
          Export
        </button>
      </LabelTooltip>
      <LabelTooltip label="Delete" describe={false}>
        <button type="button" disabled aria-label="Delete" data-testid="delete">
          <svg aria-hidden="true" />
        </button>
      </LabelTooltip>
    </>,
  );
  const [exportBox, deleteBox] = container.querySelectorAll('[data-slot="tooltip-disabled-trigger"]');
  await hover(exportBox!);
  const exportButton = container.querySelector('[data-testid="export"]')!;
  const id = exportButton.getAttribute("aria-describedby");
  assert.ok(id);
  assert.equal(exportBox!.hasAttribute("aria-describedby"), false);
  assert.equal(document.getElementById(id)?.textContent, "Generate the shots first");
  await hover(deleteBox!);
  assert.equal(container.querySelector('[data-testid="delete"]')!.hasAttribute("aria-describedby"), false);
});

test("a LabelTooltip that repeats the name keeps an aria-describedby passed to it", async () => {
  const { container } = await mount(
    <LabelTooltip label="Archive" aria-describedby="shortcut">
      <button type="button" aria-label="Archive">
        <svg aria-hidden="true" />
      </button>
    </LabelTooltip>,
  );
  const button = container.querySelector("button")!;
  await hover(button);
  assert.equal(button.getAttribute("aria-describedby"), "shortcut");
});

test("a tooltip mounted before the page went full screen opens inside the full-screen element", async () => {
  const { container } = await mount(
    <div data-testid="player">
      <LabelTooltip label="Mute">
        <button type="button" aria-label="Mute">
          <svg aria-hidden="true" />
        </button>
      </LabelTooltip>
    </div>,
  );
  const player = container.querySelector('[data-testid="player"]')!;
  Object.defineProperty(document, "fullscreenElement", { configurable: true, get: () => player });
  try {
    await hover(container.querySelector("button")!);
    const content = document.querySelector('[data-slot="tooltip-content"]');
    assert.ok(content);
    assert.equal(player.contains(content), true);
  } finally {
    delete (document as { fullscreenElement?: unknown }).fullscreenElement;
  }
});

test("an icon-sized ToolbarButton and a SortableHead show their words in the theme's tooltip, not a native title", async () => {
  const { container } = await mount(
    <>
      <Toolbar label="Formatting">
        <ToolbarButton aria-label="Bold">
          <svg aria-hidden="true" />
        </ToolbarButton>
      </Toolbar>
      <table>
        <thead>
          <tr>
            <SortableHead href="?sort=-name" direction="asc" title="Sort descending">
              Name
            </SortableHead>
          </tr>
        </thead>
      </table>
    </>,
  );
  const bold = container.querySelector('[data-slot="toolbar-button"]')!;
  await hover(bold);
  assert.equal(document.querySelector('[data-slot="tooltip-content"]')?.textContent?.includes("Bold"), true);
  // The tooltip repeats the name, so it is not a description too.
  assert.equal(bold.hasAttribute("aria-describedby"), false);
  const link = container.querySelector('[data-slot="sortable-head-link"]')!;
  assert.equal(link.hasAttribute("title"), false);
  await hover(link);
  assert.equal(
    [...document.querySelectorAll('[data-slot="tooltip-content"]')].some((content) =>
      content.textContent?.includes("Sort descending"),
    ),
    true,
  );
});

test("a LabelTooltip leaves the child's own data-state and data-slot alone", async () => {
  const { container } = await mount(
    <>
      <LabelTooltip label="Bold (Ctrl+B)">
        <Toggle aria-label="Bold" defaultPressed data-testid="bold">
          <svg aria-hidden="true" />
        </Toggle>
      </LabelTooltip>
      <ToggleGroup type="single" defaultValue="all" aria-label="Scope">
        <LabelTooltip label="Every folder">
          <ToggleGroupItem value="all" data-testid="all">
            All
          </ToggleGroupItem>
        </LabelTooltip>
      </ToggleGroup>
      <DropdownMenu>
        <LabelTooltip label="More actions">
          <DropdownMenuTrigger asChild>
            <button type="button" aria-label="More" data-testid="more">
              <svg aria-hidden="true" />
            </button>
          </DropdownMenuTrigger>
        </LabelTooltip>
        <DropdownMenuContent>
          <DropdownMenuItem>Rename</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>,
  );
  const bold = container.querySelector('[data-testid="bold"]')!;
  assert.equal(bold.getAttribute("data-state"), "on");
  assert.equal(bold.getAttribute("data-slot"), "toggle");
  await hover(bold);
  assert.equal(bold.getAttribute("data-state"), "on");
  assert.ok(bold.getAttribute("aria-describedby"));
  assert.equal(container.querySelector('[data-testid="all"]')!.getAttribute("data-state"), "on");
  const more = container.querySelector('[data-testid="more"]')!;
  await act(async () => {
    more.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));
  });
  assert.equal(more.getAttribute("data-state"), "open");
});

test("a click on a tooltip does not reach what its trigger sits in", async () => {
  const onRowClick = mock.fn();
  const { container } = await mount(
    <div role="presentation" onClick={onRowClick}>
      <LabelTooltip label="3 messages">
        <span data-testid="count">3</span>
      </LabelTooltip>
    </div>,
  );
  await hover(container.querySelector('[data-testid="count"]')!);
  const content = document.querySelector<HTMLElement>('[data-slot="tooltip-content"]')!;
  await act(async () => content.click());
  assert.equal(onRowClick.mock.callCount(), 0);
});

test("a LabelTooltip whose label starts repeating the name keeps the same child element", async () => {
  const mounts = mock.fn();
  function Child(props: React.ComponentProps<"button">) {
    // Counts how often React mounts the child, which a change in the tree around it would do again.
    React.useEffect(() => mounts(), []);
    return (
      <button type="button" aria-label="Theme" {...props}>
        <svg aria-hidden="true" />
      </button>
    );
  }
  const { rerender } = await mount(
    <LabelTooltip label="Theme: dark">
      <Child />
    </LabelTooltip>,
  );
  await rerender(
    <LabelTooltip label="Theme" describe={false}>
      <Child />
    </LabelTooltip>,
  );
  assert.equal(mounts.mock.callCount(), 1);
});

test("a ToolbarButton's tooltip can say more than its name, such as the shortcut", async () => {
  const { container } = await mount(
    <Toolbar label="Formatting">
      <ToolbarButton aria-label="Bold" tooltip="Bold (Ctrl+B)">
        <svg aria-hidden="true" />
      </ToolbarButton>
    </Toolbar>,
  );
  const bold = container.querySelector('[data-slot="toolbar-button"]')!;
  assert.equal(bold.hasAttribute("title"), false);
  await hover(bold);
  assert.equal(document.querySelector('[data-slot="tooltip-content"]')?.textContent?.includes("Bold (Ctrl+B)"), true);
  assert.ok(bold.getAttribute("aria-describedby"));
});
