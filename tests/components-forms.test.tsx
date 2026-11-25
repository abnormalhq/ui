// The browser environment has to come first: see support/dom.ts.
import { click, render } from "./support/render.tsx";
import assert from "node:assert/strict";
import { afterEach, mock, test } from "node:test";
import { act, useState } from "react";
import { toast } from "sonner";
import { CopyButton } from "@/components/ui/copy-button";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { FileButton } from "@/components/ui/file-button";
import { InputGroupButton } from "@/components/ui/input-group";
import { PasswordInput } from "@/components/ui/password-input";
import { Toaster } from "@/components/ui/sonner";
import { Turnstile } from "@/components/ui/turnstile";
import { useTurnstile } from "@/components/ui/use-turnstile";

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

const one = <T extends Element = HTMLElement>(selector: string, root: ParentNode = document) => {
  const element = root.querySelector<T>(selector);
  assert.ok(element, selector);
  return element;
};
const named = (name: string) => {
  const match = [...document.querySelectorAll<HTMLElement>("button, input")].find(
    (element) => (element.getAttribute("aria-label") ?? element.textContent?.trim()) === name,
  );
  assert.ok(match, `a control named ${name}`);
  return match;
};
/** Typing, the way React hears it: the value set through the element's own setter, then an input event. */
const type = async (input: HTMLInputElement, value: string) => {
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
};
const press = async (element: Element, key: string) => {
  const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });
  await act(async () => void element.dispatchEvent(event));
  return event.defaultPrevented;
};
const settle = () => act(async () => void (await new Promise((resolve) => setTimeout(resolve))));

const dateTimeProps = {
  locale: "en-GB",
  today: "2026-11-10",
  placeholder: "Choose a date",
  calendarLabel: "Choose the start",
  previousLabel: "Previous month",
  nextLabel: "Next month",
  timeLabel: "Start time",
};
const dayButton = () => one<HTMLButtonElement>('[data-slot="date-picker-trigger"]');
const timeInput = () => one<HTMLInputElement>('input[type="time"]');

test("a DateTimePicker submits a day and a time as datetime-local text, and only once both are set", async () => {
  const onValueChange = mock.fn();
  const { container } = await mount(
    <form>
      <DateTimePicker {...dateTimeProps} name="start" onValueChange={onValueChange} />
    </form>,
  );
  const form = one<HTMLFormElement>("form", container);
  assert.equal(timeInput().getAttribute("aria-label"), "Start time");
  assert.equal(new FormData(form).get("start"), "");

  await type(timeInput(), "09:30");
  assert.equal(new FormData(form).get("start"), "", "a time without a day is not a value yet");
  assert.equal(onValueChange.mock.callCount(), 0);

  await click(dayButton());
  await press(document.activeElement!, "ArrowRight");
  await click(document.activeElement!);
  assert.equal(new FormData(form).get("start"), "2026-11-11T09:30");
  assert.deepEqual(onValueChange.mock.calls.at(-1)?.arguments, ["2026-11-11T09:30"]);
  assert.equal(dayButton().textContent, "11 Nov 2026");

  await type(timeInput(), "");
  assert.equal(new FormData(form).get("start"), "");
  assert.deepEqual(onValueChange.mock.calls.at(-1)?.arguments, [""]);
});

test("a DateTimePicker takes its time from the theme's list as well as from the keyboard", async () => {
  const { container } = await mount(
    <form>
      <DateTimePicker {...dateTimeProps} name="start" defaultValue="2026-11-12T09:00" timeListLabel="Choose a time" />
    </form>,
  );
  const form = one<HTMLFormElement>("form", container);
  const clock = one<HTMLButtonElement>('[data-slot="time-picker-trigger"]');
  assert.equal(clock.getAttribute("aria-label"), "Choose a time");
  await click(clock);
  assert.equal(one('[role="listbox"]').getAttribute("aria-label"), "Choose a time");
  await click(one('[role="option"][data-value="10:30"]'));
  assert.equal(new FormData(form).get("start"), "2026-11-12T10:30");
  assert.equal(timeInput().value, "10:30");
});

test("a DateTimePicker fills its default time, keeps the time to min and max on their days, and follows a reset", async () => {
  const { container } = await mount(
    <form>
      <DateTimePicker
        {...dateTimeProps}
        name="start"
        defaultValue="2026-11-12T22:00"
        defaultTime="08:00"
        min="2026-11-12T18:00"
        max="2026-11-20T06:00"
      />
    </form>,
  );
  const form = one<HTMLFormElement>("form", container);
  assert.equal(new FormData(form).get("start"), "2026-11-12T22:00");
  assert.equal(timeInput().min, "18:00", "the first day starts at min");
  assert.equal(timeInput().max, "");

  await type(timeInput(), "");
  await settle();
  await click(dayButton());
  await press(document.activeElement!, "ArrowRight");
  await click(document.activeElement!);
  // A day chosen while the time is empty starts at the default time.
  assert.equal(new FormData(form).get("start"), "2026-11-13T08:00");
  assert.equal(timeInput().min, "");

  await act(async () => form.reset());
  await settle();
  assert.equal(new FormData(form).get("start"), "2026-11-12T22:00");
  assert.equal(timeInput().value, "22:00");
  assert.equal(dayButton().textContent, "12 Nov 2026");
});

test("a DateTimePicker keeps the seconds of its value, min and max when its step is under a minute", async () => {
  const onValueChange = mock.fn();
  const { container } = await mount(
    <form>
      <DateTimePicker
        {...dateTimeProps}
        name="start"
        step={15}
        defaultValue="2026-11-12T09:30:45"
        min="2026-11-12T09:30:15"
        max="2026-11-20T18:00:30.5"
        onValueChange={onValueChange}
      />
    </form>,
  );
  const form = one<HTMLFormElement>("form", container);
  assert.equal(timeInput().value, "09:30:45");
  assert.equal(timeInput().min, "09:30:15");
  assert.equal(new FormData(form).get("start"), "2026-11-12T09:30:45");
  await type(timeInput(), "10:00:15");
  assert.deepEqual(onValueChange.mock.calls.at(-1)?.arguments, ["2026-11-12T10:00:15"]);
  assert.equal(new FormData(form).get("start"), "2026-11-12T10:00:15");
});

test("a clearable DateTimePicker empties the day and the time together", async () => {
  const onValueChange = mock.fn();
  const { container } = await mount(
    <form>
      <DateTimePicker
        {...dateTimeProps}
        name="start"
        defaultValue="2026-11-12T22:00"
        clearable
        clearLabel="No start"
        onValueChange={onValueChange}
      />
    </form>,
  );
  const form = one<HTMLFormElement>("form", container);
  await click(dayButton());
  const clear = [...document.querySelectorAll<HTMLButtonElement>('[role="dialog"] button')].find(
    (button) => button.textContent === "No start",
  )!;
  await click(clear);
  assert.deepEqual(onValueChange.mock.calls.at(-1)?.arguments, [""]);
  assert.equal(new FormData(form).get("start"), "");
  assert.equal(timeInput().value, "");
  assert.equal(dayButton().textContent, "Choose a date");

  await settle();
  await act(async () => form.reset());
  await settle();
  assert.equal(new FormData(form).get("start"), "2026-11-12T22:00");
});

test("a controlled DateTimePicker shows what its owner holds", async () => {
  function Owner() {
    const [value, setValue] = useState("2026-11-12T10:15");
    return (
      <>
        <DateTimePicker {...dateTimeProps} value={value} onValueChange={setValue} />
        <button type="button" onClick={() => setValue("2026-12-01T07:45")}>
          Move
        </button>
        <output>{value}</output>
      </>
    );
  }
  await mount(<Owner />);
  assert.equal(timeInput().value, "10:15");
  await type(timeInput(), "11:00");
  assert.equal(one("output").textContent, "2026-11-12T11:00");
  await click(named("Move"));
  assert.equal(timeInput().value, "07:45");
  assert.equal(dayButton().textContent, "1 Dec 2026");
});

/** Choosing files, the way the browser reports it: the input's files, then a change event. */
const chooseFiles = async (input: HTMLInputElement, files: File[]) => {
  Object.defineProperty(input, "files", { configurable: true, value: files });
  await act(async () => void input.dispatchEvent(new Event("change", { bubbles: true })));
};

test("a FileButton opens its hidden file input and hands back the files chosen", async () => {
  const onFiles = mock.fn();
  await mount(
    <FileButton accept=".csv,text/csv" multiple onFiles={onFiles}>
      Choose CSV
    </FileButton>,
  );
  const input = one<HTMLInputElement>('input[type="file"]');
  assert.equal(input.hidden, true);
  assert.equal(input.tabIndex, -1);
  assert.equal(input.accept, ".csv,text/csv");
  assert.equal(input.multiple, true);
  const opened = mock.method(input, "click", () => {});
  await click(named("Choose CSV"));
  assert.equal(opened.mock.callCount(), 1);
  assert.equal(named("Choose CSV").getAttribute("type"), "button");

  const file = new File(["a,b"], "people.csv", { type: "text/csv" });
  await chooseFiles(input, [file]);
  assert.deepEqual(onFiles.mock.calls[0]?.arguments, [[file]]);
  // A cancelled chooser hands back nothing, and nothing is reported.
  await chooseFiles(input, []);
  assert.equal(onFiles.mock.callCount(), 1);
});

test("a FileButton with a name submits with its form, and a disabled one opens nothing", async () => {
  const { rerender } = await mount(
    <form>
      <FileButton name="avatar">Upload</FileButton>
    </form>,
  );
  const input = one<HTMLInputElement>('input[type="file"]');
  assert.equal(input.name, "avatar");
  await rerender(
    <form>
      <FileButton name="avatar" disabled>
        Upload
      </FileButton>
    </form>,
  );
  const opened = mock.method(input, "click", () => {});
  await click(named("Upload"));
  assert.equal(opened.mock.callCount(), 0);
  assert.equal(input.disabled, true);
});

test("a PasswordInput shows and hides what was typed, named by what the button will do", async () => {
  const onVisibleChange = mock.fn();
  const { container } = await mount(
    <form>
      <PasswordInput
        id="password"
        name="password"
        showLabel="Show password"
        hideLabel="Hide password"
        onVisibleChange={onVisibleChange}
        actions={<InputGroupButton>Generate</InputGroupButton>}
      />
    </form>,
  );
  const input = one<HTMLInputElement>("#password");
  assert.equal(input.type, "password");
  await type(input, "hunter2");

  await click(named("Show password"));
  assert.equal(input.type, "text");
  assert.equal(input.value, "hunter2");
  assert.deepEqual(onVisibleChange.mock.calls[0]?.arguments, [true]);
  assert.equal(named("Hide password").getAttribute("aria-controls"), "password");
  assert.ok(named("Generate"));

  // A reset hides it again, with the value back on its default.
  await act(async () => one<HTMLFormElement>("form", container).reset());
  await settle();
  assert.equal(input.type, "password");
  assert.equal(input.value, "");
});

test("a PasswordInput writes its labels out with toggle=text, and a controlled one waits for its owner", async () => {
  await mount(<PasswordInput aria-label="Password" toggle="text" visible={false} showLabel="Show" hideLabel="Hide" />);
  const toggle = named("Show");
  assert.equal(toggle.hasAttribute("aria-label"), false);
  await click(toggle);
  assert.equal(named("Password").getAttribute("type"), "password");
});

/** A stand-in for window.turnstile: it records each widget and lets the test call its callbacks. */
function fakeTurnstile() {
  const widgets: { container: HTMLElement; options: Record<string, (value?: string) => unknown> }[] = [];
  const api = {
    render: mock.fn((container: HTMLElement, options: Record<string, (value?: string) => unknown>) => {
      widgets.push({ container, options });
      return `widget-${widgets.length}`;
    }),
    reset: mock.fn(),
    remove: mock.fn(),
  };
  Object.defineProperty(window, "turnstile", { configurable: true, value: api });
  return { api, widgets };
}

test("useTurnstile renders the widget once, in the page's theme, and holds a form until its token", async () => {
  const { api, widgets } = fakeTurnstile();
  document.documentElement.dataset.theme = "dark";
  const submitted = mock.fn();
  function Form() {
    const { mount, status, waiting, guard, reset, token } = useTurnstile({
      siteKey: "site-key",
      action: "subscribe",
      language: "zh-cn",
      fieldName: "token",
    });
    return (
      <form
        onSubmit={(event) => {
          guard(event);
          if (event.defaultPrevented) return;
          event.preventDefault();
          submitted(token());
          reset();
        }}
      >
        <div ref={mount} />
        <button type="submit" disabled={waiting}>
          Send
        </button>
        <output>{status}</output>
      </form>
    );
  }
  await mount(<Form />);
  await settle();
  assert.equal(api.render.mock.callCount(), 1);
  const { options } = widgets[0]!;
  assert.equal(options.sitekey, "site-key");
  assert.equal(options.action, "subscribe");
  assert.equal(options.theme, "dark");
  assert.equal(options.language, "zh-cn");
  assert.equal(options["response-field-name"], "token");
  assert.equal(one("output").textContent, "pending");

  // A submission before the token, such as a password manager's requestSubmit(), is stopped.
  await act(async () => void one<HTMLFormElement>("form").requestSubmit());
  assert.equal(submitted.mock.callCount(), 0);

  await act(async () => void options.callback!("token-1"));
  assert.equal(one("output").textContent, "ready");
  await act(async () => void one<HTMLFormElement>("form").requestSubmit());
  assert.deepEqual(submitted.mock.calls[0]?.arguments, ["token-1"]);
  // The token is spent: a fresh one is on its way.
  assert.equal(api.reset.mock.callCount(), 1);
  assert.equal(one("output").textContent, "pending");

  await act(async () => void options["error-callback"]!());
  assert.equal(one("output").textContent, "failed");
  assert.equal(named("Send").hasAttribute("disabled"), false, "a failed check leaves the decision to the server");

  await mounted.pop()!.unmount();
  assert.equal(api.remove.mock.callCount(), 1);
  delete document.documentElement.dataset.theme;
  delete (window as { turnstile?: unknown }).turnstile;
});

test("useTurnstile forgets a removed widget's token, so the same widget rendered again waits for its own", async () => {
  const { api, widgets } = fakeTurnstile();
  const submitted = mock.fn();
  function Form({ shown, siteKey }: { shown: boolean; siteKey: string | null }) {
    const { mount, status, guard, token } = useTurnstile({ siteKey });
    return (
      <form
        onSubmit={(event) => {
          guard(event);
          if (event.defaultPrevented) return;
          event.preventDefault();
          submitted(token());
        }}
      >
        {shown && <div ref={mount} />}
        <output>{status}</output>
      </form>
    );
  }
  const status = () => one("output").textContent;
  const submit = () => act(async () => void one<HTMLFormElement>("form").requestSubmit());
  const pass = async () => {
    await settle();
    await act(async () => void widgets.at(-1)!.options.callback!("token"));
    assert.equal(status(), "ready");
  };

  const { rerender } = await mount(<Form shown siteKey="site-key" />);
  await pass();
  // The mount element hidden and shown again: a new widget, with no token yet.
  await rerender(<Form shown={false} siteKey="site-key" />);
  await rerender(<Form shown siteKey="site-key" />);
  await settle();
  assert.equal(api.render.mock.callCount(), 2);
  assert.equal(status(), "pending");
  await submit();
  assert.equal(submitted.mock.callCount(), 0, "the guard holds the form while token() is empty");

  await pass();
  // The key turned off and back on.
  await rerender(<Form shown siteKey={null} />);
  assert.equal(status(), "off");
  await rerender(<Form shown siteKey="site-key" />);
  await settle();
  assert.equal(status(), "pending");
  await submit();
  assert.equal(submitted.mock.callCount(), 0);
  delete (window as { turnstile?: unknown }).turnstile;
});

test("Turnstile renders nothing without a site key, and asks for a fresh token when its reset key changes", async () => {
  const { api } = fakeTurnstile();
  const onStatusChange = mock.fn();
  const { container, rerender } = await mount(<Turnstile siteKey={null} />);
  assert.equal(container.innerHTML, "");

  await rerender(<Turnstile siteKey="site-key" resetKey={0} onStatusChange={onStatusChange} />);
  await settle();
  assert.equal(api.render.mock.callCount(), 1);
  assert.ok(one('[data-slot="turnstile"]'));
  await rerender(<Turnstile siteKey="site-key" resetKey={1} onStatusChange={onStatusChange} />);
  assert.equal(api.reset.mock.callCount(), 1);
  assert.deepEqual(onStatusChange.mock.calls.at(-1)?.arguments, ["pending"]);
  delete (window as { turnstile?: unknown }).turnstile;
});

test("the copy button falls back to a selection copy where there is no clipboard, and keeps its focus", async () => {
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: undefined });
  let selected = "";
  const execCommand = mock.fn((command: string) => {
    selected = (document.activeElement as HTMLTextAreaElement | null)?.value ?? "";
    return command === "copy";
  });
  Object.defineProperty(document, "execCommand", { configurable: true, value: execCommand });
  await mount(<CopyButton text="10.0.0.2:4341" label="Copy" copiedLabel="Copied" failedLabel="Copy failed" />);
  await click(named("Copy"));
  assert.deepEqual(execCommand.mock.calls[0]?.arguments, ["copy"]);
  assert.equal(selected, "10.0.0.2:4341");
  assert.equal(document.querySelector("textarea"), null, "the textarea is gone again");
  assert.equal(document.activeElement, named("Copy"));
  assert.equal(document.querySelector('[role="status"]')?.textContent, "Copied");
  delete (document as { execCommand?: unknown }).execCommand;
});

test("a Toaster given toastOptions keeps its own toast class next to the page's", async () => {
  await mount(<Toaster toastOptions={{ classNames: { toast: "page-toast", title: "page-title" } }} className="mine" />);
  await act(async () => void toast("Draft saved"));
  await settle();
  const item = one("[data-sonner-toast]");
  assert.match(item.className, /\bcn-toast\b/);
  assert.match(item.className, /\bpage-toast\b/);
  assert.match(one("[data-sonner-toaster]").className, /\btoaster\b.*\bmine\b/);
});

test("the copy button tells the page how the copy went, with the text or the error", async () => {
  const onCopied = mock.fn();
  const onCopyFailed = mock.fn();
  const failure = new Error("Denied");
  let refuse = false;
  const write = async () => {
    if (refuse) throw failure;
  };
  await mount(
    <CopyButton
      text="hello@example.com"
      label="Copy"
      copiedLabel="Copied"
      failedLabel="Copy failed"
      write={write}
      onCopied={onCopied}
      onCopyFailed={onCopyFailed}
    />,
  );
  await click(named("Copy"));
  assert.deepEqual(onCopied.mock.calls[0]?.arguments, ["hello@example.com"]);
  assert.equal(onCopyFailed.mock.callCount(), 0);
  refuse = true;
  await click(named("Copy"));
  assert.deepEqual(onCopyFailed.mock.calls[0]?.arguments, [failure]);
  assert.equal(onCopied.mock.callCount(), 1);
});

test("a DateTimePicker given formatValue writes its day the page's way beside the time", async () => {
  await mount(<DateTimePicker {...dateTimeProps} defaultValue="2026-11-12T09:05" formatValue={(day) => day} />);
  assert.equal(dayButton().textContent, "2026-11-12");
  assert.equal(timeInput().value, "09:05");
});
