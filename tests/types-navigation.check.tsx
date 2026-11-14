/*
 * Checked by `pnpm typecheck` and never run, as types.check.tsx: the names a screen reader speaks for the app shell
 * and form items stay required, and the date and time field keeps the date picker's "both month names or neither".
 */
import { DatePicker } from "@/components/ui/date-picker";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { LanguagePicker } from "@/components/ui/language-picker";
import { NavTabs } from "@/components/ui/nav-tabs";
import { PasswordInput } from "@/components/ui/password-input";
import { ResizeHandle } from "@/components/ui/resize-handle";
import { SidebarItem, SidebarNav, SidebarToggle } from "@/components/ui/sidebar";
import { Toc } from "@/components/ui/toc";
import { Toolbar } from "@/components/ui/toolbar";

const picker = {
  locale: "en-GB",
  placeholder: "Choose",
  calendarLabel: "Choose a date",
  previousLabel: "Previous",
  nextLabel: "Next",
};

export const shellNames = [
  // @ts-expect-error The landmark needs a name.
  <SidebarNav key="nav" />,
  <SidebarNav key="nav-named" label="Main" />,
  // @ts-expect-error A row needs a name, which the rail moves into its tooltip.
  <SidebarItem key="item" icon={null} />,
  <SidebarItem key="item-named" icon={null} label="Inbox" />,
  // @ts-expect-error The toggle is named by what it will do, both ways.
  <SidebarToggle key="toggle" collapseLabel="Collapse" />,
  <SidebarToggle key="toggle-named" expandLabel="Expand" collapseLabel="Collapse" />,
  // @ts-expect-error The landmark needs a name.
  <NavTabs key="tabs" />,
  <NavTabs key="tabs-named" label="Sections" />,
  // @ts-expect-error The toolbar needs a name.
  <Toolbar key="toolbar" />,
  <Toolbar key="toolbar-named" label="Formatting" />,
  // @ts-expect-error The handle needs a name and the size it holds.
  <ResizeHandle key="handle" value={null} />,
  <ResizeHandle key="handle-named" label="Resize" value={null} />,
  // @ts-expect-error The landmark needs a name.
  <Toc key="toc" />,
  <Toc key="toc-named" label="On this page" />,
  // @ts-expect-error The button needs a name.
  <LanguagePicker key="language" options={[]} value="en" />,
  <LanguagePicker key="language-named" options={[]} value="en" label="Language" />,
  // @ts-expect-error The toggle is named by what it will do, both ways.
  <PasswordInput key="password" showLabel="Show" />,
  <PasswordInput key="password-named" showLabel="Show" hideLabel="Hide" />,
  // @ts-expect-error The time input needs a name.
  <DateTimePicker key="moment" {...picker} />,
  <DateTimePicker key="moment-named" {...picker} timeLabel="Time" />,
  // @ts-expect-error The month list and the year list are named together.
  <DateTimePicker key="moment-jump" {...picker} timeLabel="Time" monthLabel="Month" />,
  <DateTimePicker key="moment-jump-both" {...picker} timeLabel="Time" monthLabel="Month" yearLabel="Year" />,
];

declare const closedRange: (range: { from: string; to: string }) => void;

/** A field that may be left empty names its clear button, and a range open at one end names its two choices. */
export const optionalDates = [
  // @ts-expect-error The clear button needs its words.
  <DatePicker key="clear" {...picker} clearable />,
  <DatePicker key="clear-named" {...picker} clearable clearLabel="Clear" />,
  // @ts-expect-error The time field's clear button too.
  <DateTimePicker key="moment-clear" {...picker} timeLabel="Time" clearable />,
  <DateTimePicker key="moment-clear-named" {...picker} timeLabel="Time" clearable clearLabel="Clear" />,
  // A closed range hands back both ends, as before.
  <DateRangePicker key="range" {...picker} onValueChange={closedRange} />,
  // @ts-expect-error A clearable range can hand back null, which a handler for both ends does not take.
  <DateRangePicker key="range-clear" {...picker} clearable clearLabel="Clear" onValueChange={closedRange} />,
  <DateRangePicker
    key="range-clear-null"
    {...picker}
    clearable
    clearLabel="Clear"
    onValueChange={(range) => void range?.to.length}
  />,
  // @ts-expect-error The two buttons that keep one end need their words.
  <DateRangePicker key="partial" {...picker} allowPartial />,
  <DateRangePicker
    key="partial-named"
    {...picker}
    allowPartial
    fromOnlyLabel="From this day"
    toOnlyLabel="Until this day"
    defaultValue={{ from: null, to: "2026-11-20" }}
  />,
  // @ts-expect-error Only a range that allows it may miss an end.
  <DateRangePicker key="partial-value" {...picker} defaultValue={{ from: null, to: "2026-11-20" }} />,
];
