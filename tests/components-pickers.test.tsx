// The browser environment has to come first: see support/dom.ts.
import { click, render } from "./support/render.tsx";
import assert from "node:assert/strict";
import { afterEach, mock, test } from "node:test";
import { act } from "react";
import { Calendar } from "@/components/ui/calendar";
import { addDays, addMonths, clampDate, monthGrid, parseISODate } from "@/components/ui/calendar-date";
import { Combobox } from "@/components/ui/combobox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { DatePicker } from "@/components/ui/date-picker";
import { InputOTP } from "@/components/ui/input-otp";
import { Slider } from "@/components/ui/slider";

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

/** A key the way a keyboard sends it to the focused element; returns whether the component took it. */
const press = async (element: Element, key: string, init: KeyboardEventInit = {}) => {
  const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true, ...init });
  await act(async () => void element.dispatchEvent(event));
  return event.defaultPrevented;
};

/** Typing, the way React hears it: the value set through the element's own setter, then an input event. */
const type = async (input: HTMLInputElement, value: string) => {
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
};

const one = <T extends Element = HTMLElement>(selector: string, root: ParentNode = document) => {
  const element = root.querySelector<T>(selector);
  assert.ok(element, selector);
  return element;
};
const texts = (selector: string) => [...document.querySelectorAll(selector)].map(({ textContent }) => textContent);

test("an InputOTP is one labelled field that keeps only the characters of a code", async () => {
  const onValueChange = mock.fn();
  const onComplete = mock.fn();
  const { container } = await mount(
    <form>
      <InputOTP
        name="code"
        length={6}
        aria-label="Verification code"
        onValueChange={onValueChange}
        onComplete={onComplete}
      />
    </form>,
  );
  const inputs = container.querySelectorAll("input");
  assert.equal(inputs.length, 1, "one field, whatever the number of boxes");
  const input = inputs[0]!;
  assert.equal(input.getAttribute("aria-label"), "Verification code");
  assert.equal(input.getAttribute("autocomplete"), "one-time-code");
  assert.equal(input.getAttribute("inputmode"), "numeric");
  assert.equal(input.getAttribute("pattern"), "[0-9]*");
  // The boxes are a picture of the value.
  const slots = () => [...container.querySelectorAll('[data-slot="input-otp-slot"]')];
  assert.equal(slots().length, 6);
  assert.equal(slots()[0]!.parentElement!.getAttribute("aria-hidden"), "true");

  await type(input, "12a3");
  assert.equal(input.value, "123");
  assert.deepEqual(
    slots().map(({ textContent }) => textContent),
    ["1", "2", "3", "", "", ""],
  );
  assert.equal(new FormData(container.querySelector("form")!).get("code"), "123");
  assert.equal(onComplete.mock.callCount(), 0);

  // More than fits is cut at the length, and the last character completes the code once.
  await type(input, "1234567");
  assert.equal(input.value, "123456");
  assert.deepEqual(
    onComplete.mock.calls.map(({ arguments: args }) => args),
    [["123456"]],
  );
  assert.deepEqual(onValueChange.mock.calls.at(-1)?.arguments, ["123456"]);
});

test("a paste into an InputOTP replaces the code and drops the separators", async () => {
  const onComplete = mock.fn();
  const { container } = await mount(<InputOTP defaultValue="111111" aria-label="Code" onComplete={onComplete} />);
  const input = one<HTMLInputElement>("input", container);
  const paste = async (text: string) => {
    const event = new Event("paste", { bubbles: true, cancelable: true });
    Object.defineProperty(event, "clipboardData", { value: { getData: () => text } });
    await act(async () => void input.dispatchEvent(event));
    return event.defaultPrevented;
  };
  assert.equal(await paste("987-654"), true);
  assert.equal(input.value, "987654");
  assert.equal(onComplete.mock.callCount(), 1);
  await paste(" 12 34 ");
  assert.equal(input.value, "1234");
  // Nothing usable in the clipboard leaves the code alone.
  await paste("code:");
  assert.equal(input.value, "1234");
});

test("an InputOTP lights the box that takes the next character, and can take letters", async () => {
  const { container, rerender } = await mount(<InputOTP defaultValue="12" aria-label="Code" />);
  const input = one<HTMLInputElement>("input", container);
  const active = () =>
    [...container.querySelectorAll('[data-slot="input-otp-slot"]')].findIndex((slot) =>
      slot.hasAttribute("data-active"),
    );
  assert.equal(active(), -1);
  await act(async () => input.focus());
  assert.equal(active(), 2);
  await act(async () => input.blur());
  assert.equal(active(), -1);

  await rerender(<InputOTP key="letters" accept="alphanumeric" length={4} aria-label="Code" aria-invalid />);
  const letters = one<HTMLInputElement>("input", container);
  await type(letters, "a1-B2");
  assert.equal(letters.value, "a1B2");
  assert.equal(letters.getAttribute("aria-invalid"), "true");
});

test("a controlled InputOTP shows what its owner holds", async () => {
  const onValueChange = mock.fn();
  const { container } = await mount(<InputOTP value="12" onValueChange={onValueChange} aria-label="Code" />);
  const input = one<HTMLInputElement>("input", container);
  await type(input, "123");
  assert.deepEqual(
    onValueChange.mock.calls.map(({ arguments: args }) => args),
    [["123"]],
  );
  assert.equal(input.value, "12");
});

test("a Slider's thumb is the slider: named, valued, and moved by the keyboard", async () => {
  const onValueChange = mock.fn();
  const { container } = await mount(
    <Slider
      defaultValue={[20]}
      min={5}
      max={50}
      step={5}
      aria-label="Mailbox quota"
      getValueText={(value) => `${value} GB`}
      onValueChange={onValueChange}
    />,
  );
  const thumb = one('[role="slider"]', container);
  assert.equal(thumb.getAttribute("aria-label"), "Mailbox quota");
  // The name is on the thumb only: the root has no role to carry one.
  assert.equal(one('[data-slot="slider"]', container).getAttribute("aria-label"), null);
  assert.deepEqual(
    ["aria-valuemin", "aria-valuenow", "aria-valuemax", "aria-valuetext", "aria-orientation", "tabindex"].map((name) =>
      thumb.getAttribute(name),
    ),
    ["5", "20", "50", "20 GB", "horizontal", "0"],
  );

  await act(async () => thumb.focus());
  const now = () => thumb.getAttribute("aria-valuenow");
  await press(thumb, "ArrowRight");
  assert.equal(now(), "25");
  assert.equal(thumb.getAttribute("aria-valuetext"), "25 GB");
  await press(thumb, "ArrowLeft");
  await press(thumb, "ArrowDown");
  assert.equal(now(), "15");
  await press(thumb, "PageUp");
  assert.equal(now(), "50", "ten steps, held at the maximum");
  await press(thumb, "Home");
  assert.equal(now(), "5");
  await press(thumb, "End");
  assert.equal(now(), "50");
  assert.deepEqual(onValueChange.mock.calls.at(-1)?.arguments, [[50]]);
});

test("a range Slider names each thumb with the labels it is given", async () => {
  const { container } = await mount(
    <Slider defaultValue={[10, 40]} thumbLabels={["最小", "最大"]} aria-labelledby="ignored" disabled />,
  );
  const thumbs = [...container.querySelectorAll('[role="slider"]')];
  assert.deepEqual(
    thumbs.map((thumb) => thumb.getAttribute("aria-label")),
    ["最小", "最大"],
  );
  assert.deepEqual(
    thumbs.map((thumb) => thumb.getAttribute("aria-labelledby")),
    [null, null],
  );
  assert.deepEqual(
    thumbs.map((thumb) => thumb.getAttribute("aria-valuenow")),
    ["10", "40"],
  );
  // A disabled slider is not a tab stop.
  assert.deepEqual(
    thumbs.map((thumb) => thumb.getAttribute("tabindex")),
    [null, null],
  );
});

const palette = (props: Partial<React.ComponentProps<typeof Command>> = {}, onSelect = mock.fn()) => (
  <Command {...props}>
    <CommandInput label="Search commands" placeholder="Type a command" />
    <CommandList>
      <CommandGroup heading="Mail">
        <CommandItem value="Compose" keywords={["new", "write"]} onSelect={onSelect}>
          Compose
        </CommandItem>
        <CommandItem value="Archive" onSelect={onSelect}>
          Archive
        </CommandItem>
      </CommandGroup>
      <CommandSeparator />
      <CommandGroup heading="Workspace">
        <CommandItem value="Billing" disabled onSelect={onSelect}>
          Billing
        </CommandItem>
        <CommandItem value="Settings" onSelect={onSelect}>
          Settings
        </CommandItem>
      </CommandGroup>
    </CommandList>
    <CommandEmpty>No command matches</CommandEmpty>
  </Command>
);

test("a Command is a combobox field that controls a listbox and points at the highlighted option", async () => {
  await mount(palette());
  const input = one<HTMLInputElement>('[role="combobox"]');
  const list = one('[role="listbox"]');
  assert.equal(input.getAttribute("aria-label"), "Search commands");
  assert.equal(input.getAttribute("aria-controls"), list.id);
  assert.equal(input.getAttribute("aria-expanded"), "true");
  assert.equal(input.getAttribute("aria-autocomplete"), "list");
  const options = [...list.querySelectorAll('[role="option"]')];
  assert.deepEqual(
    options.map(({ textContent }) => textContent),
    ["Compose", "Archive", "Billing", "Settings"],
  );
  // The listbox owns options and named groups, nothing else.
  const groups = [...list.querySelectorAll('[role="group"]')];
  assert.deepEqual(
    groups.map((group) => document.getElementById(group.getAttribute("aria-labelledby")!)?.textContent),
    ["Mail", "Workspace"],
  );
  assert.equal(one('[data-slot="command-separator"]').getAttribute("aria-hidden"), "true");
  assert.equal(options[2]!.getAttribute("aria-disabled"), "true");

  const active = () => document.getElementById(input.getAttribute("aria-activedescendant") ?? "")?.textContent;
  const selected = () => texts('[role="option"][aria-selected="true"]');
  assert.equal(active(), "Compose");
  assert.deepEqual(selected(), ["Compose"]);
});

test("a Command moves the highlight with the arrows, past disabled options and around the ends", async () => {
  const onSelect = mock.fn();
  await mount(palette({}, onSelect));
  const input = one<HTMLInputElement>('[role="combobox"]');
  const active = () => document.getElementById(input.getAttribute("aria-activedescendant") ?? "")?.textContent;

  assert.equal(await press(input, "ArrowDown"), true);
  assert.equal(active(), "Archive");
  await press(input, "ArrowDown");
  assert.equal(active(), "Settings", "Billing is disabled");
  await press(input, "ArrowDown");
  assert.equal(active(), "Compose", "wraps to the first");
  await press(input, "ArrowUp");
  assert.equal(active(), "Settings", "and back to the last");
  // Home and End belong to the text in the field.
  assert.equal(await press(input, "Home"), false);
  assert.equal(active(), "Settings");

  assert.equal(await press(input, "Enter"), true);
  assert.deepEqual(
    onSelect.mock.calls.map(({ arguments: args }) => args),
    [["Settings"]],
  );
  // Enter that confirms an input method's composition is not a choice.
  await press(input, "Enter", { isComposing: true });
  assert.equal(onSelect.mock.callCount(), 1);

  // A click chooses too; a disabled option does not.
  await click(one('[role="option"][aria-disabled="true"]'));
  assert.equal(onSelect.mock.callCount(), 1);
  await click([...document.querySelectorAll('[role="option"]')][1]!);
  assert.deepEqual(onSelect.mock.calls.at(-1)?.arguments, ["Archive"]);
});

test("typing in a Command filters by value and keywords, and says so when nothing matches", async () => {
  const onSearchChange = mock.fn();
  await mount(palette({ onSearchChange }));
  const input = one<HTMLInputElement>('[role="combobox"]');
  const options = () => texts('[role="option"]');
  const active = () => document.getElementById(input.getAttribute("aria-activedescendant") ?? "")?.textContent;
  const status = one('[role="status"]');
  assert.equal(status.textContent, "");

  await press(input, "ArrowDown");
  await type(input, "s");
  assert.deepEqual(options(), ["Compose", "Settings"]);
  assert.equal(active(), "Compose", "a new search starts from the first match");
  assert.equal(document.querySelector('[data-slot="command-separator"]'), null);

  await type(input, "WRITE");
  assert.deepEqual(options(), ["Compose"], "a keyword, whatever the case");
  await type(input, "set  ings");
  assert.deepEqual(options(), ["Settings"], "every word, in any order");
  assert.deepEqual(onSearchChange.mock.calls.at(-1)?.arguments, ["set  ings"]);

  await type(input, "zzz");
  assert.deepEqual(options(), []);
  assert.equal(input.getAttribute("aria-activedescendant"), null);
  // The message arrives in a status region that was already there, outside the listbox.
  assert.equal(status.textContent, "No command matches");
  assert.equal(status.closest('[role="listbox"]'), null);
  assert.equal(await press(input, "Enter"), false);

  await type(input, "");
  assert.equal(options().length, 4);
  assert.equal(status.textContent, "");
});

test("a Command that does not filter shows what the page renders, and takes another rule", async () => {
  const { rerender } = await mount(palette({ shouldFilter: false, search: "zzz", onSearchChange: () => {} }));
  assert.equal(texts('[role="option"]').length, 4);
  assert.equal(one<HTMLInputElement>('[role="combobox"]').value, "zzz");

  await rerender(
    palette({ search: "arch", onSearchChange: () => {}, filter: ({ value }, search) => value.startsWith(search) }),
  );
  assert.deepEqual(texts('[role="option"]'), []);
  await rerender(
    palette({ search: "Arch", onSearchChange: () => {}, filter: ({ value }, search) => value.startsWith(search) }),
  );
  assert.deepEqual(texts('[role="option"]'), ["Archive"]);
});

const regions = [
  { value: "eu-central", label: "Frankfurt", keywords: ["Germany"] },
  { value: "us-west", label: "Oregon", keywords: ["America"] },
  { value: "us-east", label: "Virginia", keywords: ["America"] },
  { value: "sa-east", label: "São Paulo", disabled: true },
];
const comboboxProps = {
  options: regions,
  placeholder: "Choose a region",
  searchLabel: "Search regions",
  emptyMessage: "No region matches",
};
const trigger = () => one<HTMLButtonElement>('[data-slot="combobox-trigger"]');

test("a Combobox is a button that opens a search field over a listbox, and submits its value", async () => {
  const onValueChange = mock.fn();
  const { container } = await mount(
    <form>
      <Combobox {...comboboxProps} name="region" defaultValue="us-west" onValueChange={onValueChange} id="region" />
    </form>,
  );
  const form = one<HTMLFormElement>("form", container);
  assert.equal(trigger().id, "region");
  // A combobox whose popup is a dialog: its value, the chosen option, is read after its name.
  assert.equal(trigger().getAttribute("role"), "combobox");
  assert.equal(trigger().getAttribute("aria-haspopup"), "dialog");
  assert.equal(trigger().getAttribute("aria-expanded"), "false");
  assert.equal(trigger().textContent, "Oregon");
  assert.equal(new FormData(form).get("region"), "us-west");
  assert.equal(document.querySelector('[role="listbox"]'), null);

  await click(trigger());
  assert.equal(trigger().getAttribute("aria-expanded"), "true");
  const dialog = one('[role="dialog"]');
  assert.equal(dialog.getAttribute("aria-label"), "Search regions");
  assert.equal(trigger().getAttribute("aria-controls"), dialog.id);
  const input = one<HTMLInputElement>('input[role="combobox"]', dialog);
  assert.equal(input.getAttribute("aria-label"), "Search regions");
  assert.equal(input.getAttribute("aria-controls"), one('[role="listbox"]', dialog).id);
  // The chosen option is the selected one, and the highlight starts on it.
  assert.deepEqual(texts('[role="option"][aria-selected="true"]'), ["Oregon"]);
  assert.equal(document.getElementById(input.getAttribute("aria-activedescendant")!)?.textContent, "Oregon");

  await type(input, "america");
  assert.deepEqual(texts('[role="option"]'), ["Oregon", "Virginia"]);
  await press(input, "ArrowDown");
  await press(input, "Enter");
  assert.deepEqual(
    onValueChange.mock.calls.map(({ arguments: args }) => args),
    [["us-east"]],
  );
  assert.equal(document.querySelector('[role="dialog"]'), null, "choosing closes the popover");
  assert.equal(trigger().textContent, "Virginia");
  assert.equal(new FormData(form).get("region"), "us-east");
});

test("a Combobox shows its placeholder and empty message, and clears only when clearable", async () => {
  const onValueChange = mock.fn();
  const combobox = (clearable: boolean) => (
    <Combobox {...comboboxProps} clearable={clearable} onValueChange={onValueChange} aria-label="Region" />
  );
  const { rerender } = await mount(combobox(false));
  assert.equal(trigger().textContent, "Choose a region");
  assert.ok(trigger().hasAttribute("data-placeholder"));

  await click(trigger());
  await type(one<HTMLInputElement>('input[role="combobox"]'), "zzz");
  assert.equal(one('[role="status"]').textContent, "No region matches");
  await type(one<HTMLInputElement>('input[role="combobox"]'), "");
  assert.equal(one('[role="option"][aria-disabled="true"]').textContent, "São Paulo");
  await click(one('[role="option"]'));
  assert.equal(trigger().textContent, "Frankfurt");

  // Choosing the chosen option again keeps it and reports nothing.
  await click(trigger());
  await click(one('[role="option"]'));
  assert.equal(trigger().textContent, "Frankfurt");
  assert.deepEqual(
    onValueChange.mock.calls.map(({ arguments: args }) => args),
    [["eu-central"]],
  );

  await rerender(combobox(true));
  await click(trigger());
  await click(one('[role="option"]'));
  assert.equal(trigger().textContent, "Choose a region");
  assert.deepEqual(onValueChange.mock.calls.at(-1)?.arguments, [null]);
});

const calendarProps = { locale: "en-GB", previousLabel: "Previous month", nextLabel: "Next month" };
const day = (date: string) => one<HTMLButtonElement>(`[data-date="${date}"]`);
const caption = () => one('[data-slot="calendar-caption"]').textContent;
const focusedDay = () => (document.activeElement as HTMLElement | null)?.dataset.date;

test("a Calendar is a grid named by its month, with one tab stop and every day named in full", async () => {
  const { container } = await mount(<Calendar {...calendarProps} today="2026-11-10" defaultValue="2026-11-18" />);
  const grid = one('[role="grid"]', container);
  assert.equal(document.getElementById(grid.getAttribute("aria-labelledby")!)?.textContent, "November 2026");
  assert.equal(one('[data-slot="calendar-caption"]').getAttribute("aria-live"), "polite");
  assert.deepEqual(
    [...grid.querySelectorAll("th")].map((th) => [th.getAttribute("scope"), th.getAttribute("abbr")]),
    ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((name) => ["col", name]),
  );
  // Six weeks whatever the month, so the height never changes.
  assert.equal(grid.querySelectorAll("tbody tr").length, 6);
  assert.equal(grid.querySelectorAll('[role="gridcell"]').length, 42);
  const days = [...grid.querySelectorAll<HTMLButtonElement>('[data-slot="calendar-day"]')];
  assert.equal(days.length, 30);

  // The full date, as the locale writes it (the comma depends on the ICU release).
  assert.match(day("2026-11-18").getAttribute("aria-label")!, /^Wednesday,? 18 November 2026$/);
  assert.equal(day("2026-11-18").closest("td")!.getAttribute("aria-selected"), "true");
  assert.equal(grid.querySelectorAll('[aria-selected="true"]').length, 1);
  assert.equal(day("2026-11-10").getAttribute("aria-current"), "date");
  assert.equal(grid.querySelectorAll("[aria-current]").length, 1);
  assert.deepEqual(
    days.filter(({ tabIndex }) => tabIndex === 0).map(({ dataset }) => dataset.date),
    ["2026-11-18"],
  );
  assert.ok(one('button[aria-label="Previous month"]', container));
  assert.ok(one('button[aria-label="Next month"]', container));
});

test("a Calendar moves by day, week, month and year from the keyboard, turning the page at the edges", async () => {
  const onMonthChange = mock.fn();
  await mount(
    <Calendar {...calendarProps} today="2026-11-10" defaultValue="2026-11-18" onMonthChange={onMonthChange} />,
  );
  const go = async (key: string, init?: KeyboardEventInit) => {
    assert.equal(await press(document.activeElement!, key, init), true, key);
    return focusedDay();
  };
  await act(async () => day("2026-11-18").focus());

  assert.equal(await go("ArrowRight"), "2026-11-19");
  assert.equal(await go("ArrowLeft"), "2026-11-18");
  assert.equal(await go("ArrowDown"), "2026-11-25");
  assert.equal(await go("ArrowUp"), "2026-11-18");
  // The week runs Monday to Sunday unless told otherwise.
  assert.equal(await go("Home"), "2026-11-16");
  assert.equal(await go("End"), "2026-11-22");
  assert.equal(day("2026-11-22").tabIndex, 0, "the tab stop follows");
  assert.equal(day("2026-11-18").tabIndex, -1);

  assert.equal(await go("PageDown"), "2026-12-22");
  assert.equal(caption(), "December 2026");
  assert.equal(await go("PageUp", { shiftKey: true }), "2025-12-22");
  assert.equal(await go("PageDown", { shiftKey: true }), "2026-12-22");
  assert.equal(await go("PageUp"), "2026-11-22");
  // Past the last row is the next month.
  await act(async () => day("2026-11-30").focus());
  assert.equal(await go("ArrowDown"), "2026-12-07");
  assert.equal(caption(), "December 2026");
  assert.deepEqual(onMonthChange.mock.calls.at(-1)?.arguments, ["2026-12"]);
  // Other keys are left to the page.
  assert.equal(await press(document.activeElement!, "a"), false);
});

test("a Calendar chooses on click, and keeps days outside its range unavailable but reachable", async () => {
  const onValueChange = mock.fn();
  await mount(
    <Calendar
      {...calendarProps}
      today="2026-11-10"
      min="2026-11-03"
      max="2026-12-15"
      isDateDisabled={(date) => date === "2026-11-12"}
      onValueChange={onValueChange}
    />,
  );
  await click(day("2026-11-11"));
  assert.deepEqual(
    onValueChange.mock.calls.map(({ arguments: args }) => args),
    [["2026-11-11"]],
  );
  assert.equal(day("2026-11-11").closest("td")!.getAttribute("aria-selected"), "true");

  for (const date of ["2026-11-02", "2026-11-12"]) {
    assert.equal(day(date).getAttribute("aria-disabled"), "true", date);
    assert.equal(day(date).disabled, false, "still focusable, so the arrows are never trapped");
    await click(day(date));
  }
  assert.equal(onValueChange.mock.callCount(), 1);

  // The keyboard stops at the first and last day, and the month buttons at their months.
  await act(async () => day("2026-11-04").focus());
  await press(document.activeElement!, "ArrowUp");
  assert.equal(focusedDay(), "2026-11-03");
  assert.equal(one<HTMLButtonElement>('button[aria-label="Previous month"]').disabled, true);
  await click(one('button[aria-label="Next month"]'));
  assert.equal(caption(), "December 2026");
  assert.equal(one<HTMLButtonElement>('button[aria-label="Next month"]').disabled, true);
  assert.equal(day("2026-12-16").getAttribute("aria-disabled"), "true");
});

test("a Calendar speaks the locale it is given and starts the week where it is told", async () => {
  const { rerender } = await mount(
    <Calendar locale="de-DE" previousLabel="Vorheriger Monat" nextLabel="Nächster Monat" defaultMonth="2026-03" />,
  );
  assert.equal(caption(), "März 2026");
  assert.equal(one("th").getAttribute("abbr"), "Montag");
  assert.equal(day("2026-03-01").getAttribute("aria-label"), "Sonntag, 1. März 2026");
  assert.ok(one('button[aria-label="Nächster Monat"]'));

  await rerender(<Calendar key="us" {...calendarProps} locale="en-US" weekStartsOn={0} month="2026-03" />);
  assert.equal(one("th").getAttribute("abbr"), "Sunday");
  // March 2026 starts on a Sunday: with Sunday first, the 1st leads the grid.
  assert.equal(one("tbody td").textContent, "1");
  await rerender(<Calendar key="ar" {...calendarProps} locale="ar-EG" month="2026-03" />);
  assert.equal(day("2026-03-15").textContent, "١٥");
});

test("a Calendar marks the browser's today when the page passes none", async () => {
  mock.timers.enable({ apis: ["Date"], now: new Date(2026, 10, 10, 9) });
  await mount(<Calendar {...calendarProps} />);
  mock.timers.reset();
  assert.equal(caption(), "November 2026");
  assert.equal(day("2026-11-10").getAttribute("aria-current"), "date");
  assert.equal(day("2026-11-10").tabIndex, 0);
});

const datePickerProps = {
  ...calendarProps,
  placeholder: "Choose a date",
  calendarLabel: "Choose a renewal date",
  today: "2026-11-10",
};
const dateTrigger = () => one<HTMLButtonElement>('[data-slot="date-picker-trigger"]');

test("a DatePicker opens a named calendar on the chosen day, and closes on a choice", async () => {
  const onValueChange = mock.fn();
  const { container } = await mount(
    <form>
      <DatePicker {...datePickerProps} name="renewal" defaultValue="2026-11-18" onValueChange={onValueChange} />
    </form>,
  );
  const form = one<HTMLFormElement>("form", container);
  assert.equal(dateTrigger().textContent, "18 Nov 2026");
  assert.equal(dateTrigger().getAttribute("role"), "combobox");
  assert.equal(dateTrigger().getAttribute("aria-haspopup"), "dialog");
  assert.equal(dateTrigger().getAttribute("aria-expanded"), "false");
  assert.equal(new FormData(form).get("renewal"), "2026-11-18");

  await click(dateTrigger());
  assert.equal(one('[role="dialog"]').getAttribute("aria-label"), "Choose a renewal date");
  assert.equal(caption(), "November 2026");
  assert.equal(focusedDay(), "2026-11-18", "focus lands on the chosen day, not on a month button");

  await press(document.activeElement!, "ArrowRight");
  await click(document.activeElement!);
  assert.deepEqual(
    onValueChange.mock.calls.map(({ arguments: args }) => args),
    [["2026-11-19"]],
  );
  assert.equal(document.querySelector('[role="dialog"]'), null);
  assert.equal(dateTrigger().textContent, "19 Nov 2026");
  assert.equal(new FormData(form).get("renewal"), "2026-11-19");
});

test("a DatePicker writes the day the way the locale does, and shows its placeholder without one", async () => {
  await mount(<DatePicker {...datePickerProps} aria-label="Renewal" />);
  assert.equal(dateTrigger().textContent, "Choose a date");
  assert.ok(dateTrigger().hasAttribute("data-placeholder"));
  await click(dateTrigger());
  assert.equal(focusedDay(), "2026-11-10", "today, while nothing is chosen");
  await mounted.pop()!.unmount();

  await mount(<DatePicker {...datePickerProps} locale="en-US" value="2026-03-01" aria-label="Renewal" />);
  assert.equal(dateTrigger().textContent, "Mar 1, 2026");
  await mounted.pop()!.unmount();
  await mount(
    <DatePicker
      {...datePickerProps}
      locale="de-DE"
      value="2026-03-01"
      dateFormat={{ dateStyle: "full" }}
      disabled
      name="renewal"
      aria-label="Verlängerung"
    />,
  );
  assert.equal(dateTrigger().textContent, "Sonntag, 1. März 2026");
  assert.equal(dateTrigger().disabled, true);
  // A disabled field is left out of the form.
  assert.equal(document.querySelector('input[name="renewal"]'), null);
});

test("the calendar dates are plain text and never drift across a time zone or a short month", () => {
  assert.equal(parseISODate("2026-02-30"), undefined);
  assert.equal(parseISODate("10/11/2026"), undefined);
  assert.equal(parseISODate(null), undefined);
  assert.equal(parseISODate("2026-11-10")?.toISOString(), "2026-11-10T00:00:00.000Z");
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
  assert.equal(addDays("2024-03-01", -1), "2024-02-29");
  // A daylight-saving change does not make a day 23 hours long here.
  assert.equal(addDays("2026-03-28", 2), "2026-03-30");
  assert.equal(addMonths("2026-01-31", 1), "2026-02-28");
  assert.equal(addMonths("2024-02-29", 12), "2025-02-28");
  assert.equal(addMonths("2026-11-18", -11), "2025-12-18");
  assert.equal(clampDate("2026-11-01", "2026-11-03", "2026-11-20"), "2026-11-03");
  assert.equal(clampDate("2026-11-30", "2026-11-03", "2026-11-20"), "2026-11-20");
  assert.equal(clampDate("2026-11-10"), "2026-11-10");
  const grid = monthGrid("2026-11", 1);
  assert.equal(grid.length, 42);
  assert.deepEqual([grid[0], grid[6], grid[41]], ["2026-10-26", "2026-11-01", "2026-12-06"]);
  assert.equal(monthGrid("2026-11", 0)[0], "2026-11-01");
});
