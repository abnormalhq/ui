// The browser environment has to come first: see support/dom.ts.
import { click, render } from "./support/render.tsx";
import assert from "node:assert/strict";
import { afterEach, mock, test } from "node:test";
import { act } from "react";
import { Calendar } from "@/components/ui/calendar";
import { addDays, addMonths, clampDate, monthGrid, orderRange, parseISODate } from "@/components/ui/calendar-date";
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
import { DateRangePicker } from "@/components/ui/date-range-picker";
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

/** Choosing in a list, the way React hears it: the value set, then a change event. */
const choose = async (select: HTMLSelectElement, value: string) => {
  await act(async () => {
    select.value = value;
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
};

/** The pointer arriving on an element, and leaving it for somewhere outside the calendar. */
const hover = (element: Element) =>
  act(async () => void element.dispatchEvent(new MouseEvent("mouseover", { bubbles: true })));
const leave = (element: Element) =>
  act(
    async () => void element.dispatchEvent(new MouseEvent("mouseout", { bubbles: true, relatedTarget: document.body })),
  );

/** Lets the timers of a closed popover run: Radix hands the focus back to the trigger in one, after the close. */
const settle = () => act(async () => void (await new Promise((resolve) => setTimeout(resolve))));

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
  assert.deepEqual(orderRange("2026-11-18", "2026-11-12"), { from: "2026-11-12", to: "2026-11-18" });
  assert.deepEqual(orderRange("2026-11-12", "2026-11-12"), { from: "2026-11-12", to: "2026-11-12" });
  const grid = monthGrid("2026-11", 1);
  assert.equal(grid.length, 42);
  assert.deepEqual([grid[0], grid[6], grid[41]], ["2026-10-26", "2026-11-01", "2026-12-06"]);
  assert.equal(monthGrid("2026-11", 0)[0], "2026-11-01");
});

test("month arithmetic keeps a year below 100 instead of moving it to the 1900s", () => {
  assert.equal(addMonths("0099-05-10", 1), "0099-06-10");
  assert.equal(addMonths("0099-12-31", 2), "0100-02-28");
  assert.equal(addMonths("0001-03-31", -1), "0001-02-28");
});

test("a read-only InputOTP ignores a paste, as it ignores typing", async () => {
  const onValueChange = mock.fn();
  const onComplete = mock.fn();
  const { container } = await mount(
    <InputOTP defaultValue="111111" readOnly aria-label="Code" onValueChange={onValueChange} onComplete={onComplete} />,
  );
  const input = one<HTMLInputElement>("input", container);
  const event = new Event("paste", { bubbles: true, cancelable: true });
  Object.defineProperty(event, "clipboardData", { value: { getData: () => "987654" } });
  await act(async () => void input.dispatchEvent(event));
  assert.equal(input.value, "111111");
  assert.equal(onValueChange.mock.callCount(), 0);
  assert.equal(onComplete.mock.callCount(), 0);
});

test("a Calendar names its Gregorian grid in Gregorian words, whatever calendar the locale prefers", async () => {
  await mount(<Calendar {...calendarProps} locale="fa-IR" month="2026-11" today="2026-11-10" />);
  const gregorian = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("fa-IR", { timeZone: "UTC", calendar: "gregory", ...options }).format(
      new Date("2026-11-01T00:00:00Z"),
    );
  const persian = new Intl.DateTimeFormat("fa-IR", { timeZone: "UTC", month: "long", year: "numeric" }).format(
    new Date("2026-11-01T00:00:00Z"),
  );
  assert.equal(caption(), gregorian({ month: "long", year: "numeric" }));
  assert.notEqual(caption(), persian);
  assert.equal(day("2026-11-01").getAttribute("aria-label"), gregorian({ dateStyle: "full" }));
});

test("a form reset puts an uncontrolled Combobox and DatePicker back on their defaults", async () => {
  const { container } = await mount(
    <form>
      <Combobox {...comboboxProps} name="region" defaultValue="us-west" />
      <DatePicker {...datePickerProps} name="renewal" defaultValue="2026-11-18" />
    </form>,
  );
  const form = one<HTMLFormElement>("form", container);
  await click(trigger());
  const input = one<HTMLInputElement>('[role="dialog"] input[role="combobox"]');
  await type(input, "america");
  await press(input, "ArrowDown");
  await press(input, "Enter");
  assert.equal(new FormData(form).get("region"), "us-east");
  // Or the focus the closed combobox hands back lands after the calendar has taken it.
  await settle();

  await click(dateTrigger());
  await press(document.activeElement!, "ArrowRight");
  await click(document.activeElement!);
  assert.equal(new FormData(form).get("renewal"), "2026-11-19");

  await act(async () => form.reset());
  assert.equal(new FormData(form).get("region"), "us-west");
  assert.equal(trigger().textContent, "Oregon");
  assert.equal(new FormData(form).get("renewal"), "2026-11-18");
  assert.equal(dateTrigger().textContent, "18 Nov 2026");
});

test("a cancelled form reset leaves a Combobox and a DatePicker alone, as a browser leaves a native field", async () => {
  const fields = (cancel: boolean) => (
    <form
      onReset={(event) => {
        if (cancel) event.preventDefault();
      }}
    >
      <Combobox {...comboboxProps} name="region" defaultValue="us-west" />
      <DatePicker {...datePickerProps} name="renewal" defaultValue="2026-11-18" />
      <button type="reset">Reset</button>
    </form>
  );
  const { container, rerender } = await mount(fields(true));
  const form = one<HTMLFormElement>("form", container);
  // Only the registry's fields: happy-dom resets native ones before it dispatches the event, cancelled or not.
  const submitted = () => ["region", "renewal"].map((name) => new FormData(form).get(name));

  await click(trigger());
  const input = one<HTMLInputElement>('[role="dialog"] input[role="combobox"]');
  await type(input, "america");
  await press(input, "ArrowDown");
  await press(input, "Enter");
  await settle();
  await click(dateTrigger());
  await press(document.activeElement!, "ArrowRight");
  await click(document.activeElement!);
  await settle();
  assert.deepEqual(submitted(), ["us-east", "2026-11-19"]);

  // The page says no in React's onReset, which runs after the form's own listeners: nothing may have moved by then.
  await act(async () => form.reset());
  await settle();
  assert.deepEqual(submitted(), ["us-east", "2026-11-19"]);
  assert.equal(trigger().textContent, "Virginia");
  assert.equal(dateTrigger().textContent, "19 Nov 2026");
  // The same from a reset button.
  await click(one('button[type="reset"]', container));
  await settle();
  assert.deepEqual(submitted(), ["us-east", "2026-11-19"]);

  // A reset that goes through takes both back.
  await rerender(fields(false));
  await click(one('button[type="reset"]', container));
  assert.deepEqual(submitted(), ["us-west", "2026-11-18"]);
  assert.equal(trigger().textContent, "Oregon");
  assert.equal(dateTrigger().textContent, "18 Nov 2026");
});

const selectedDays = () =>
  [...document.querySelectorAll('td[aria-selected="true"] [data-date]')].map(
    (node) => (node as HTMLElement).dataset.date,
  );
const previewDays = () =>
  [...document.querySelectorAll<HTMLElement>("[data-preview]")].map(({ dataset }) => dataset.date);
const lastRange = (spy: { mock: { calls: { arguments: unknown[] }[] } }) => spy.mock.calls.at(-1)?.arguments[0];

test("a range Calendar takes its two ends in either order, and marks every day between them selected", async () => {
  const onValueChange = mock.fn();
  await mount(<Calendar {...calendarProps} mode="range" today="2026-11-10" onValueChange={onValueChange} />);
  const grid = one('[role="grid"]');
  assert.equal(grid.getAttribute("aria-multiselectable"), "true");
  assert.deepEqual(selectedDays(), []);

  await click(day("2026-11-18"));
  assert.deepEqual(lastRange(onValueChange), { from: "2026-11-18", to: null });
  assert.deepEqual(selectedDays(), ["2026-11-18"]);
  // The second end may come before the first: the range is handed back in order.
  await click(day("2026-11-16"));
  assert.deepEqual(lastRange(onValueChange), { from: "2026-11-16", to: "2026-11-18" });
  assert.deepEqual(selectedDays(), ["2026-11-16", "2026-11-17", "2026-11-18"]);
  // The ends are the highlighter, the day between them the band.
  assert.deepEqual(
    ["2026-11-16", "2026-11-17", "2026-11-18"].map((date) => [
      day(date).hasAttribute("data-selected"),
      day(date).dataset.range,
    ]),
    [
      [true, "start"],
      [false, "middle"],
      [true, "end"],
    ],
  );
  assert.equal(day("2026-11-17").closest("td")!.dataset.range, "middle");
  assert.equal(day("2026-11-15").dataset.range, undefined);

  // A third choice starts over, and the same day twice is a range of one day.
  await click(day("2026-11-24"));
  assert.deepEqual(lastRange(onValueChange), { from: "2026-11-24", to: null });
  assert.deepEqual(selectedDays(), ["2026-11-24"]);
  await click(day("2026-11-24"));
  assert.deepEqual(lastRange(onValueChange), { from: "2026-11-24", to: "2026-11-24" });
  assert.deepEqual(selectedDays(), ["2026-11-24"]);
  assert.equal(day("2026-11-24").dataset.range, undefined);
  assert.equal(onValueChange.mock.callCount(), 4);
});

test("a range Calendar previews the range under the pointer and under the keyboard focus", async () => {
  const onValueChange = mock.fn();
  await mount(
    <Calendar
      {...calendarProps}
      mode="range"
      today="2026-11-10"
      isDateDisabled={(date) => date === "2026-11-21"}
      onValueChange={onValueChange}
    />,
  );
  // Nothing to preview before the first end is chosen.
  await hover(day("2026-11-12"));
  assert.deepEqual(previewDays(), []);

  await click(day("2026-11-18"));
  await hover(day("2026-11-20"));
  assert.deepEqual(previewDays(), ["2026-11-19", "2026-11-20"]);
  assert.deepEqual(
    ["2026-11-18", "2026-11-19", "2026-11-20"].map((date) => day(date).dataset.range),
    ["start", "middle", "end"],
  );
  // A preview is not a selection: only the chosen end is selected, and nothing was reported.
  assert.deepEqual(selectedDays(), ["2026-11-18"]);
  assert.equal(onValueChange.mock.callCount(), 1);
  // Backwards too, and a day that cannot be chosen previews nothing.
  await hover(day("2026-11-16"));
  assert.deepEqual(previewDays(), ["2026-11-16", "2026-11-17"]);
  assert.equal(day("2026-11-18").dataset.range, "end");
  await hover(day("2026-11-21"));
  assert.deepEqual(previewDays(), []);
  await hover(day("2026-11-20"));
  await leave(one('[role="grid"]'));
  assert.deepEqual(previewDays(), []);

  // From the keyboard the preview follows the focus, across the turn of a page, and the choice closes the range.
  await act(async () => day("2026-11-18").focus());
  await press(document.activeElement!, "ArrowRight");
  assert.deepEqual(previewDays(), ["2026-11-19"]);
  await press(document.activeElement!, "ArrowDown");
  assert.equal(focusedDay(), "2026-11-26");
  assert.equal(previewDays().length, 8);
  await press(document.activeElement!, "PageDown");
  assert.equal(focusedDay(), "2026-12-26");
  assert.equal(caption(), "December 2026");
  assert.deepEqual([previewDays()[0], previewDays().at(-1)], ["2026-12-01", "2026-12-26"]);
  await click(document.activeElement!);
  assert.deepEqual(lastRange(onValueChange), { from: "2026-11-18", to: "2026-12-26" });
  assert.deepEqual(previewDays(), []);
  assert.equal(selectedDays().length, 26, "the days of the range in December");
  // The band runs on through the days of the neighbouring months that fill the first and last rows.
  const fillers = () =>
    [...document.querySelectorAll<HTMLElement>("td[data-range]")].filter((cell) => !cell.querySelector("button"));
  assert.equal(fillers().length, 1, "November 30 in December's first row");
  await click(one('button[aria-label="Previous month"]'));
  assert.equal(fillers().length, 6, "December 1 to 6 in November's last row");
});

test("a range Calendar keeps to min, max and the days that cannot be chosen, for both ends", async () => {
  const onValueChange = mock.fn();
  await mount(
    <Calendar
      {...calendarProps}
      mode="range"
      today="2026-11-10"
      min="2026-11-03"
      max="2026-11-27"
      isDateDisabled={(date) => date === "2026-11-12"}
      onValueChange={onValueChange}
    />,
  );
  for (const date of ["2026-11-02", "2026-11-12", "2026-11-28"]) await click(day(date));
  assert.equal(onValueChange.mock.callCount(), 0);
  await click(day("2026-11-10"));
  for (const date of ["2026-11-12", "2026-11-28"]) await click(day(date));
  assert.deepEqual(lastRange(onValueChange), { from: "2026-11-10", to: null });
  // The keyboard stops at the last day, and a range may run across a day that cannot be an end.
  await act(async () => day("2026-11-24").focus());
  await press(document.activeElement!, "ArrowDown");
  assert.equal(focusedDay(), "2026-11-27");
  await click(document.activeElement!);
  assert.deepEqual(lastRange(onValueChange), { from: "2026-11-10", to: "2026-11-27" });
  assert.equal(day("2026-11-12").getAttribute("aria-disabled"), "true");
  assert.equal(day("2026-11-12").closest("td")!.getAttribute("aria-selected"), "true");
});

test("a range Calendar starts over when its first end can no longer be chosen", async () => {
  const onValueChange = mock.fn();
  const range = (max?: string, booked?: string) => (
    <Calendar
      {...calendarProps}
      mode="range"
      today="2026-11-10"
      max={max}
      isDateDisabled={(date) => date === booked}
      onValueChange={onValueChange}
    />
  );
  const { rerender } = await mount(range());
  await click(day("2026-11-20"));
  // Fresh limits arrive between the two choices, and rule the first day out.
  await rerender(range("2026-11-15"));
  await click(day("2026-11-12"));
  assert.deepEqual(lastRange(onValueChange), { from: "2026-11-12", to: null });
  assert.deepEqual(selectedDays(), ["2026-11-12"]);
  await rerender(range("2026-11-15", "2026-11-12"));
  await click(day("2026-11-14"));
  assert.deepEqual(lastRange(onValueChange), { from: "2026-11-14", to: null });
  // A first day that is still allowed closes the range as before.
  await click(day("2026-11-09"));
  assert.deepEqual(lastRange(onValueChange), { from: "2026-11-09", to: "2026-11-14" });
});

test("a controlled range Calendar shows what its owner holds, and opens on the month of its start", async () => {
  const onValueChange = mock.fn();
  const { rerender } = await mount(
    <Calendar
      {...calendarProps}
      mode="range"
      value={{ from: "2026-03-30", to: "2026-04-02" }}
      onValueChange={onValueChange}
    />,
  );
  assert.equal(caption(), "March 2026");
  assert.deepEqual(selectedDays(), ["2026-03-30", "2026-03-31"]);
  assert.equal(day("2026-03-30").tabIndex, 0);
  await click(day("2026-03-10"));
  assert.deepEqual(lastRange(onValueChange), { from: "2026-03-10", to: null });
  assert.deepEqual(selectedDays(), ["2026-03-30", "2026-03-31"]);
  await rerender(<Calendar {...calendarProps} mode="range" value={null} month="2026-03" />);
  assert.deepEqual(selectedDays(), []);
});

const jumpProps = { ...calendarProps, monthLabel: "Month", yearLabel: "Year" };
const monthList = () => one<HTMLSelectElement>('select[aria-label="Month"]');
const yearList = () => one<HTMLSelectElement>('select[aria-label="Year"]');

test("a Calendar with month and year names jumps to any month from two lists, at the same height", async () => {
  const onMonthChange = mock.fn();
  const { container, rerender } = await mount(
    <Calendar {...jumpProps} today="2026-11-10" defaultValue="2026-11-18" onMonthChange={onMonthChange} />,
  );
  assert.deepEqual(
    [...monthList().options].map(({ textContent }) => textContent),
    "January February March April May June July August September October November December".split(" "),
  );
  assert.equal(monthList().value, "11");
  assert.equal(yearList().value, "2026");
  // Ten years either side of the one on show while nothing bounds them.
  assert.deepEqual(
    [yearList().options[0]!.textContent, yearList().options.length, yearList().options[20]!.textContent],
    ["2016", 21, "2036"],
  );
  // The month's name is still there for the grid and for the announcement, out of sight.
  const name = one('[data-slot="calendar-caption"]', container);
  assert.equal(name.textContent, "November 2026");
  assert.equal(name.getAttribute("aria-live"), "polite");
  assert.match(name.className, /\bsr-only\b/);
  assert.equal(one('[role="grid"]').getAttribute("aria-labelledby"), name.id);

  await choose(monthList(), "02");
  assert.equal(caption(), "February 2026");
  assert.deepEqual(onMonthChange.mock.calls.at(-1)?.arguments, ["2026-02"]);
  await choose(yearList(), "2031");
  assert.equal(caption(), "February 2031");
  assert.equal(yearList().options[0]!.textContent, "2021", "the list moves with the year on show");
  // February 2031 fits four weeks exactly, and still takes six rows.
  assert.equal(day("2031-02-01").closest("tr")!.querySelector("td")!.textContent, "27");
  assert.equal(document.querySelectorAll("tbody tr").length, 6);
  assert.equal(document.querySelectorAll('[role="gridcell"]').length, 42);
  // The month buttons keep the lists in step.
  await click(one('button[aria-label="Next month"]'));
  assert.equal(monthList().value, "03");

  // Without the names the caption is the month's name, and there are no lists.
  await rerender(<Calendar key="plain" {...calendarProps} defaultMonth="2026-11" />);
  assert.equal(container.querySelector("select"), null);
  assert.doesNotMatch(one('[data-slot="calendar-caption"]', container).className, /sr-only/);
});

test("the lists of a Calendar keep to min and max, and speak the locale", async () => {
  const { rerender } = await mount(
    <Calendar {...jumpProps} today="2026-11-10" defaultMonth="2026-11" min="2025-03-15" max="2027-02-10" />,
  );
  assert.deepEqual(
    [...yearList().options].map(({ value }) => value),
    ["2025", "2026", "2027"],
  );
  assert.equal([...monthList().options].filter(({ disabled }) => disabled).length, 0);
  // A year whose same month is out of reach stops at the nearest month inside.
  await choose(yearList(), "2027");
  assert.equal(caption(), "February 2027");
  assert.deepEqual(
    [...monthList().options].filter(({ disabled }) => !disabled).map(({ value }) => value),
    ["01", "02"],
  );
  await choose(yearList(), "2025");
  assert.equal(caption(), "March 2025");
  assert.deepEqual(
    [...monthList().options].filter(({ disabled }) => disabled).map(({ value }) => value),
    ["01", "02"],
  );

  await rerender(
    <Calendar
      key="de"
      locale="de-DE"
      previousLabel="Vorheriger Monat"
      nextLabel="Nächster Monat"
      monthLabel="Monat"
      yearLabel="Jahr"
      mode="range"
      month="2026-03"
    />,
  );
  assert.equal(one<HTMLSelectElement>('select[aria-label="Monat"]').selectedOptions[0]!.textContent, "März");
  assert.ok(one('select[aria-label="Jahr"]'));
});

test("the year list of a Calendar stays within the years a month can be written with", async () => {
  const years = () => [...yearList().options].map(({ value }) => value);
  const { rerender } = await mount(<Calendar {...jumpProps} today="2026-11-10" defaultMonth="0003-06" />);
  assert.deepEqual([years()[0], years().length, years().at(-1)], ["0001", 13, "0013"]);
  await choose(yearList(), "0001");
  assert.equal(caption(), "June 1");
  assert.deepEqual([years()[0], years().at(-1)], ["0001", "0011"]);
  await rerender(<Calendar key="late" {...jumpProps} today="2026-11-10" defaultMonth="9995-06" />);
  assert.deepEqual([years()[0], years().length, years().at(-1)], ["9985", 15, "9999"]);
  await choose(yearList(), "9999");
  assert.equal(caption(), "June 9999");
});

const rangePickerProps = {
  ...calendarProps,
  placeholder: "Choose a period",
  calendarLabel: "Choose a period",
  today: "2026-11-10",
};
const rangeTrigger = () => one<HTMLButtonElement>('[data-slot="date-range-picker-trigger"]');
const period = (form: HTMLFormElement) => [new FormData(form).get("from"), new FormData(form).get("to")];

test("a DateRangePicker opens a range calendar, and changes only once both ends are chosen", async () => {
  const onValueChange = mock.fn();
  const { container } = await mount(
    <form>
      <DateRangePicker
        {...rangePickerProps}
        fromName="from"
        toName="to"
        defaultValue={{ from: "2026-11-02", to: "2026-11-10" }}
        onValueChange={onValueChange}
        id="period"
      />
    </form>,
  );
  const form = one<HTMLFormElement>("form", container);
  assert.equal(rangeTrigger().id, "period");
  assert.equal(rangeTrigger().getAttribute("role"), "combobox");
  assert.equal(rangeTrigger().getAttribute("aria-haspopup"), "dialog");
  assert.equal(rangeTrigger().getAttribute("aria-expanded"), "false");
  // The range as the locale writes one (the spaces around the dash depend on the ICU release).
  assert.match(rangeTrigger().textContent!, /^2\s*–\s*10 Nov 2026$/);
  assert.deepEqual(period(form), ["2026-11-02", "2026-11-10"]);
  assert.equal(container.querySelectorAll('input[type="hidden"]').length, 2);

  await click(rangeTrigger());
  assert.equal(one('[role="dialog"]').getAttribute("aria-label"), "Choose a period");
  assert.equal(one('[role="grid"]').getAttribute("aria-multiselectable"), "true");
  assert.equal(focusedDay(), "2026-11-02", "focus lands on the start of the range");
  assert.equal(selectedDays().length, 9);

  // One end is only a draft: the popover stays, and the field and the form keep the range they had.
  await press(document.activeElement!, "ArrowDown");
  await click(document.activeElement!);
  assert.ok(document.querySelector('[role="dialog"]'));
  assert.deepEqual(selectedDays(), ["2026-11-09"]);
  assert.match(rangeTrigger().textContent!, /^2\s*–\s*10 Nov 2026$/);
  assert.deepEqual(period(form), ["2026-11-02", "2026-11-10"]);
  assert.equal(onValueChange.mock.callCount(), 0);

  await press(document.activeElement!, "ArrowLeft");
  await press(document.activeElement!, "ArrowLeft");
  assert.deepEqual(previewDays(), ["2026-11-07", "2026-11-08"]);
  await click(document.activeElement!);
  assert.deepEqual(
    onValueChange.mock.calls.map(({ arguments: args }) => args),
    [[{ from: "2026-11-07", to: "2026-11-09" }]],
  );
  assert.equal(document.querySelector('[role="dialog"]'), null, "the second end closes the popover");
  assert.match(rangeTrigger().textContent!, /^7\s*–\s*9 Nov 2026$/);
  assert.deepEqual(period(form), ["2026-11-07", "2026-11-09"]);
});

test("a DateRangePicker closed halfway keeps its range, and shows its placeholder without one", async () => {
  const onValueChange = mock.fn();
  const { container } = await mount(
    <form>
      <DateRangePicker
        {...rangePickerProps}
        {...{ monthLabel: "Month", yearLabel: "Year" }}
        fromName="from"
        toName="to"
        max="2026-11-10"
        onValueChange={onValueChange}
        aria-label="Period"
      />
    </form>,
  );
  const form = one<HTMLFormElement>("form", container);
  assert.equal(rangeTrigger().textContent, "Choose a period");
  assert.ok(rangeTrigger().hasAttribute("data-placeholder"));
  // Both fields are there and empty, as an empty date input would be.
  assert.deepEqual(period(form), ["", ""]);

  await click(rangeTrigger());
  assert.equal(focusedDay(), "2026-11-10", "today, while nothing is chosen");
  assert.ok(one('select[aria-label="Month"]'));
  assert.equal(day("2026-11-11").getAttribute("aria-disabled"), "true");
  await click(day("2026-11-03"));
  assert.deepEqual(selectedDays(), ["2026-11-03"]);
  await press(document.activeElement!, "Escape");
  await settle();
  assert.equal(document.querySelector('[role="dialog"]'), null);
  assert.equal(rangeTrigger().textContent, "Choose a period");
  assert.equal(onValueChange.mock.callCount(), 0);
  // The half-chosen range is gone when it opens again.
  await click(rangeTrigger());
  assert.deepEqual(selectedDays(), []);
  await click(day("2026-11-05"));
  await click(day("2026-11-05"));
  assert.equal(rangeTrigger().textContent, "5 Nov 2026");
  assert.deepEqual(period(form), ["2026-11-05", "2026-11-05"]);
  await settle();
  await mounted.pop()!.unmount();

  await mount(
    <DateRangePicker
      {...rangePickerProps}
      locale="en-US"
      value={{ from: "2026-12-28", to: "2027-01-03" }}
      fromName="from"
      toName="to"
      disabled
      aria-label="Period"
    />,
  );
  assert.match(rangeTrigger().textContent!, /^Dec 28, 2026\s*–\s*Jan 3, 2027$/);
  // A disabled field is left out of the form.
  assert.equal(document.querySelector('input[type="hidden"]'), null);
});

test("a form reset puts an uncontrolled DateRangePicker back on its default, unless the page cancels it", async () => {
  const fields = (cancel: boolean) => (
    <>
      <form
        id="report"
        onReset={(event) => {
          if (cancel) event.preventDefault();
        }}
      >
        <DateRangePicker
          {...rangePickerProps}
          fromName="from"
          toName="to"
          defaultValue={{ from: "2026-11-02", to: "2026-11-10" }}
          aria-label="Period"
        />
        <button type="reset">Reset</button>
      </form>
      {/* Outside the form, joined to it by the form attribute, with one field only and no default. */}
      <DateRangePicker {...rangePickerProps} form="report" toName="until" aria-label="Until" />
    </>
  );
  const { container, rerender } = await mount(fields(true));
  const form = one<HTMLFormElement>("form", container);
  const submitted = () => [...period(form), new FormData(form).get("until")];
  const [inside, outside] = [
    ...container.querySelectorAll<HTMLButtonElement>('[data-slot="date-range-picker-trigger"]'),
  ];

  await click(inside!);
  await click(day("2026-11-16"));
  await click(day("2026-11-20"));
  await settle();
  await click(outside!);
  await click(day("2026-11-24"));
  await click(day("2026-11-25"));
  await settle();
  assert.deepEqual(submitted(), ["2026-11-16", "2026-11-20", "2026-11-25"]);

  await click(one('button[type="reset"]', container));
  await settle();
  assert.deepEqual(submitted(), ["2026-11-16", "2026-11-20", "2026-11-25"]);
  assert.match(inside!.textContent!, /^16\s*–\s*20 Nov 2026$/);

  await rerender(fields(false));
  await act(async () => form.reset());
  assert.deepEqual(submitted(), ["2026-11-02", "2026-11-10", ""]);
  assert.match(inside!.textContent!, /^2\s*–\s*10 Nov 2026$/);
  assert.equal(outside!.textContent, "Choose a period");
});

test("a DateRangePicker drops a half-chosen range when its owner closes it, and when its form resets", async () => {
  const onValueChange = mock.fn();
  const held = (open: boolean) => (
    <DateRangePicker {...rangePickerProps} open={open} onValueChange={onValueChange} aria-label="Period" />
  );
  const { rerender } = await mount(held(true));
  await click(day("2026-11-03"));
  assert.deepEqual(selectedDays(), ["2026-11-03"]);
  // The page closes the popover itself, without a click the picker could hear.
  await rerender(held(false));
  await settle();
  await rerender(held(true));
  assert.deepEqual(selectedDays(), []);
  await click(day("2026-11-12"));
  assert.deepEqual(selectedDays(), ["2026-11-12"], "a first day again, not the end of the abandoned range");
  assert.equal(onValueChange.mock.callCount(), 0);
  await rerender(held(false));
  await settle();
  await mounted.pop()!.unmount();

  const { container } = await mount(
    <form>
      <DateRangePicker
        {...rangePickerProps}
        defaultValue={{ from: "2026-11-02", to: "2026-11-10" }}
        aria-label="Period"
      />
    </form>,
  );
  await click(rangeTrigger());
  await click(day("2026-11-20"));
  assert.deepEqual(selectedDays(), ["2026-11-20"]);
  await act(async () => one<HTMLFormElement>("form", container).reset());
  assert.equal(selectedDays().length, 9, "the default range, with no first day left over");
  await click(day("2026-11-24"));
  assert.deepEqual(selectedDays(), ["2026-11-24"]);
});

test("a form reset reaches a DateRangePicker that has no field names, or is disabled", async () => {
  const { container, rerender } = await mount(
    <form>
      <DateRangePicker
        {...rangePickerProps}
        defaultValue={{ from: "2026-11-02", to: "2026-11-10" }}
        aria-label="Period"
      />
    </form>,
  );
  const form = one<HTMLFormElement>("form", container);
  assert.equal(container.querySelector('input[type="hidden"]'), null);
  await click(rangeTrigger());
  await click(day("2026-11-16"));
  await click(day("2026-11-20"));
  await settle();
  assert.match(rangeTrigger().textContent!, /^16\s*–\s*20 Nov 2026$/);
  await act(async () => form.reset());
  assert.match(rangeTrigger().textContent!, /^2\s*–\s*10 Nov 2026$/);

  await click(rangeTrigger());
  await click(day("2026-11-16"));
  await click(day("2026-11-20"));
  await settle();
  await rerender(
    <form>
      <DateRangePicker
        {...rangePickerProps}
        fromName="from"
        toName="to"
        defaultValue={{ from: "2026-11-02", to: "2026-11-10" }}
        disabled
        aria-label="Period"
      />
    </form>,
  );
  assert.match(rangeTrigger().textContent!, /^16\s*–\s*20 Nov 2026$/);
  await act(async () => form.reset());
  assert.match(rangeTrigger().textContent!, /^2\s*–\s*10 Nov 2026$/);
});
