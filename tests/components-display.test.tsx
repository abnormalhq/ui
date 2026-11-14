// The browser environment has to come first: see support/dom.ts.
import { click, render } from "./support/render.tsx";
import assert from "node:assert/strict";
import { afterEach, mock, test } from "node:test";
import { act, useState } from "react";
import { Input } from "@/components/ui/input";
import { CodeBlock } from "@/components/ui/code-block";
import { ExpandableText } from "@/components/ui/expandable-text";
import { Field, FieldControl, FieldHint, FieldLabel, SwitchField } from "@/components/ui/field";
import { Progress } from "@/components/ui/progress";
import { SelectionBar } from "@/components/ui/selection-bar";
import { Tag, TagList } from "@/components/ui/tag";
import { TruncatedText } from "@/components/ui/truncated-text";

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
      this.callback([], this as unknown as ResizeObserver);
    }
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
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
    <CodeBlock title="Terminal" copyLabel="Copy" copiedLabel="Copied" failedLabel="Copy failed">
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
  assert.match(bar().className, /bg-badge-ink/);
  await rerender(<Progress value={100} tone="destructive" aria-label="Storage" />);
  assert.match(bar().className, /bg-destructive/);
});
