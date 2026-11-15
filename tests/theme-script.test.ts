import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { themeScript } from "../registry/ui/theme-script.tsx";

type Preference = "system" | "light" | "dark";
type ThemeEvent = {
  key?: string | null;
  newValue?: string | null;
  matches?: boolean;
  storageArea?: object;
};
type Listener = (event: ThemeEvent) => void;
interface ThemeApi {
  getPreference(): Preference;
  setPreference(preference: Preference): void;
}

const storageKey = "abnormal-theme";
const script = themeScript;

function initializeTheme({
  dark = false,
  stored,
  failRead = false,
  failWrite = false,
  denyStorageAccess = false,
}: {
  dark?: boolean;
  stored?: string;
  failRead?: boolean;
  failWrite?: boolean;
  denyStorageAccess?: boolean;
} = {}) {
  const values = new Map<string, string>();
  if (stored !== undefined) values.set(storageKey, stored);
  const windowListeners = new Map<string, Listener[]>();
  const mediaListeners: Listener[] = [];
  const dispatched: Event[] = [];
  const root = {
    dataset: {} as Record<string, string>,
    style: { colorScheme: "" },
  };
  const meta = {
    content: "",
    setAttribute(name: string, value: string) {
      assert.equal(name, "content");
      this.content = value;
    },
  };
  const storage = {
    getItem(key: string) {
      if (failRead) throw new Error("Storage reads unavailable");
      return values.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      if (failWrite) throw new Error("Storage writes unavailable");
      values.set(key, value);
    },
    removeItem(key: string) {
      if (failWrite) throw new Error("Storage writes unavailable");
      values.delete(key);
    },
  };
  const media = {
    matches: dark,
    addEventListener(type: string, listener: Listener) {
      assert.equal(type, "change");
      mediaListeners.push(listener);
    },
    addListener(listener: Listener) {
      mediaListeners.push(listener);
    },
  };
  const document = {
    documentElement: root,
    querySelector(selector: string) {
      assert.match(selector, /^meta\[name=['"]?theme-color['"]?\]$/);
      return meta;
    },
  };
  const window = {
    abnormalTheme: undefined as ThemeApi | undefined,
    document,
    matchMedia(query: string) {
      assert.equal(query, "(prefers-color-scheme: dark)");
      return media;
    },
    addEventListener(type: string, listener: Listener) {
      const listeners = windowListeners.get(type) ?? [];
      listeners.push(listener);
      windowListeners.set(type, listeners);
    },
    dispatchEvent(event: Event) {
      dispatched.push(event);
      return true;
    },
    get localStorage() {
      if (denyStorageAccess) throw new Error("Storage access denied");
      return storage;
    },
  };
  const context = {
    window,
    document,
    CustomEvent,
    matchMedia: window.matchMedia,
    get localStorage() {
      return window.localStorage;
    },
  };

  runInNewContext(script, context, { filename: "theme-script.js" });
  assert.ok(window.abnormalTheme, "initialization exposes the theme API");
  const api = window.abnormalTheme;

  return {
    api,
    root,
    meta,
    values,
    dispatched,
    changeSystem(nextDark: boolean) {
      media.matches = nextDark;
      for (const listener of mediaListeners) listener({ matches: nextDark });
    },
    changeOtherPage(value: string | null, key: string | null = storageKey) {
      if (key === null) values.clear();
      else if (value === null) values.delete(key);
      else values.set(key, value);
      for (const listener of windowListeners.get("storage") ?? []) {
        listener({ key, newValue: value, storageArea: storage });
      }
    },
  };
}

function assertTheme(state: ReturnType<typeof initializeTheme>, preference: Preference, resolved: "light" | "dark") {
  assert.equal(state.api.getPreference(), preference);
  // Only data-theme is written: the CSS reads it, and the preference is read through window.abnormalTheme.
  assert.deepEqual(Object.keys(state.root.dataset), ["theme"]);
  assert.equal(state.root.dataset.theme, resolved);
  assert.equal(state.root.style.colorScheme, resolved);
  assert.match(state.meta.content, /^#[\da-f]{3,8}$/i);
}

test("default theme follows both light and dark system preferences", () => {
  for (const dark of [false, true]) {
    const state = initializeTheme({ dark });
    assertTheme(state, "system", dark ? "dark" : "light");
    assert.equal(state.values.has(storageKey), false);
  }
});

test("saved light and dark choices override the system preference", () => {
  assertTheme(initializeTheme({ dark: true, stored: "light" }), "light", "light");
  assertTheme(initializeTheme({ dark: false, stored: "dark" }), "dark", "dark");
});

test("system changes update the theme live only while following the system", () => {
  const state = initializeTheme();
  const lightMeta = state.meta.content;
  state.changeSystem(true);
  assertTheme(state, "system", "dark");
  assert.notEqual(state.meta.content, lightMeta);
  state.api.setPreference("light");
  state.changeSystem(false);
  state.changeSystem(true);
  assertTheme(state, "light", "light");
  assert.equal(state.meta.content, lightMeta);
  state.api.setPreference("system");
  assertTheme(state, "system", "dark");
  state.changeSystem(false);
  assertTheme(state, "system", "light");
});

test("changing a preference saves explicit choices, clears system, and emits updates", () => {
  const state = initializeTheme({ dark: true });
  for (const preference of ["light", "dark", "system"] as const) {
    const eventCount = state.dispatched.length;
    state.api.setPreference(preference);
    assertTheme(state, preference, preference === "light" ? "light" : "dark");
    assert.equal(state.values.get(storageKey), preference === "system" ? undefined : preference);
    assert.ok(state.dispatched.length > eventCount);
    assert.equal(state.dispatched.at(-1)?.type, "abnormal:themechange");
  }
});

test("invalid stored preferences fall back to the current system theme", () => {
  for (const stored of ["", "auto", "null", "DARK", "unexpected"]) {
    assertTheme(initializeTheme({ dark: true, stored }), "system", "dark");
  }
});

test("failed storage reads preserve the default and allow manual switching", () => {
  const state = initializeTheme({
    dark: true,
    stored: "light",
    failRead: true,
  });
  assertTheme(state, "system", "dark");
  state.api.setPreference("light");
  assertTheme(state, "light", "light");
});

test("failed writes and blocked storage access never prevent switching", () => {
  for (const options of [{ failWrite: true }, { denyStorageAccess: true }]) {
    const state = initializeTheme(options);
    state.api.setPreference("dark");
    assertTheme(state, "dark", "dark");
    state.changeSystem(true);
    state.api.setPreference("light");
    assertTheme(state, "light", "light");
    state.api.setPreference("system");
    assertTheme(state, "system", "dark");
  }
});

test("cross-page storage changes refresh explicit and system preferences", () => {
  const state = initializeTheme({ dark: true });
  state.changeOtherPage("light");
  assertTheme(state, "light", "light");
  state.changeOtherPage("dark");
  assertTheme(state, "dark", "dark");
  state.changeOtherPage(null);
  assertTheme(state, "system", "dark");
  state.changeOtherPage("light");
  state.changeOtherPage("invalid");
  assertTheme(state, "system", "dark");
  state.changeOtherPage("light");
  state.changeOtherPage(null, null);
  assertTheme(state, "system", "dark");
});

test("unrelated storage updates leave the current preference unchanged", () => {
  const state = initializeTheme({ dark: true, stored: "light" });
  state.changeOtherPage("dark", "another-setting");
  assertTheme(state, "light", "light");
});

test("the theme-color of each theme is that theme's --bg", () => {
  const css = readFileSync("registry/styles/abnormal.css", "utf8");
  const bg = (selector: string) => {
    const block = css.slice(css.indexOf(selector));
    return /--bg:\s*(#[\da-f]+);/i.exec(block)?.[1];
  };
  const light = initializeTheme({ dark: false });
  const dark = initializeTheme({ dark: true });
  assert.equal(light.meta.content, bg(":root {"));
  assert.equal(dark.meta.content, bg(':root[data-theme="dark"]'));
});
