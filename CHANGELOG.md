# Changelog

All notable changes to the Abnormal UI registry are recorded here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the version is the registry's, in `package.json`, following [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Each entry names the items it touches, because a project installs items one by one and takes a change only when it reinstalls that item. The README's "Versions and updates" section says how.

## [Unreleased]

### Fixed

- `calendar`: a key that moves nowhere, such as Home on the first day of the week or an arrow past `min` or `max`, no longer leaves the grid waiting to move the focus. The next render of the calendar, whatever caused it, used to pull the focus back into the grid from the field the person had moved on to.

## [0.4.0] - 2026-11-11

A search box, so a project no longer shows the clear button each browser draws inside `type="search"`. One new item brings the registry to 65. No package was added.

### Added

- `search-input`: `Input` with the search icon at its start and a clear button at its end while it holds text. The button is the interface's close icon, the same in every browser, with a name (`clearLabel`, required) and a place in the tab order; the browser's own clear button is hidden. Clearing fires `onChange` with an empty value, controlled or not, then `onClear`, and puts the focus back in the box. `hint` shows in the same corner while the box is empty, such as the shortcut that focuses it. It takes `Input`'s three sizes and follows a form reset.

### Upgrading from 0.3.1

Nothing has to change. To adopt the item, install `search-input` and replace an `Input type="search"` and the icon beside it with `SearchInput`: `className` now sizes the box around the input, and `inputClassName` reaches the input.

## [0.3.1] - 2026-11-11

Fixes to the form reset and to the calendar's edges that 0.3.0 left open. No item and no package was added.

### Fixed

- `combobox`, `date-picker`: a form reset now reaches a field that has no `name`, or is `disabled`. The field found its form through the hidden input it submits with, which such a field does not render; the button finds it now, as in `date-range-picker`, so the button also takes the `form` attribute. A controlled field still follows its `value` prop, and a cancelled reset still leaves the field alone.
- `input-otp`: a form reset puts an uncontrolled field back on its `defaultValue`, without calling `onValueChange`, unless the page cancels the reset. React keeps the input's value attribute on the typed code, so the browser's own reset changed nothing.
- `calendar`: the grid's tab stop, which is where a `date-picker` or `date-range-picker` puts the focus when it opens, is now a day within `min` and `max`. Today, or a chosen day, outside them used to take it.
- `calendar`: without `min` or `max`, the month buttons and the keyboard stop at January of year 1 and December 9999, the limits of the year list. The previous button went on into year 0, and December 9999, or a step past it from the keyboard, made the calendar throw. The cells after 31 December 9999 are empty.
- `calendar`: `addDays` and `addMonths` in `calendar-date.ts` stop at `0001-01-01` and `9999-12-31` (exported as `FIRST_DATE` and `LAST_DATE`) instead of returning text that is not a day.

### Changed

- `input-otp`: now needs `form-reset`.

### Upgrading from 0.3.0

Reinstalling `input-otp` brings `form-reset` with it; name it in the same command when reinstalling with `--overwrite`. Reinstall `calendar` to fix `date-picker` and `date-range-picker` too: the grid is its file. Nothing else has to change.

## [0.3.0] - 2026-11-10

Date ranges for the admin console's filters, a caption that jumps to a month and a year, and form resets that respect a cancelled reset. Two new items bring the registry to 64. No package was added: the range, the lists and the hook build on `Intl`, the browser's own `<select>` (through `native-select`) and React.

### Added

- `calendar`: `mode="range"` chooses a span of days as `{ from, to }`, both days as text. The first choice is one end, the days up to the pointer or the keyboard focus preview the range, and the second choice closes it, in order whichever end came first. The grid is `aria-multiselectable` and every day of the range is `aria-selected`; `min`, `max` and `isDateDisabled` apply to both ends. `calendar-date.ts` brings the `DateRange` and `ClosedDateRange` types and `orderRange`.
- `calendar`, `date-picker`: `monthLabel` and `yearLabel`, given together, turn the caption into two lists that jump to any month and year. The names are the caller's, the month names and digits the locale's, and the grid keeps its six weeks.
- `date-range-picker`: a field for a span of days, built from `popover` and `calendar`. It changes only once both ends are chosen, writes the range the way the locale does, and with `fromName` and `toName` submits the two days as a pair of hidden form fields.
- `form-reset`: `useFormReset`, the hook `switch`, `combobox`, `date-picker` and `date-range-picker` share to follow a form reset. A project's own field can use it.

### Changed

- `slider`: `thumbLabels` is required by the types when `value` or `defaultValue` is known to hold two numbers or more (a literal such as `defaultValue={[10, 40]}`, or a tuple type), with one name per thumb. A single thumb, and a `number[]` held in state, whose length the types cannot see, are as before. A range written as a literal without `thumbLabels` now fails the type check: give it its names.
- `calendar`: now needs `native-select`, for the two lists. The single-day props and markup are unchanged.
- `switch`, `combobox`, `date-picker`: now need `form-reset`.

### Fixed

- `switch`, `combobox`, `date-picker`: a form reset the page cancels (`<form onReset={(event) => event.preventDefault()}>`) no longer puts the field back on its default while the native fields beside it keep their values. The field now waits until the reset event has finished and acts only if nobody cancelled it.

### Upgrading from 0.2.0

Reinstalling `switch`, `combobox`, `date-picker` or `calendar` brings their new items with them (`form-reset`, `native-select`); name those in the same command when reinstalling with `--overwrite`. Nothing else has to change, unless a range `Slider` was written with a literal value and no `thumbLabels`, which the type check now reports.

## [0.2.0] - 2026-11-10

Fifteen items for the admin console, the webmail and the storefront, which brings the registry to 62. No package was added: every new item builds on `radix-ui`, `lucide-react` and `class-variance-authority`, which the registry already used, or on nothing.

### Added

- `tabs`: views that swap in place, with the current tab marked in the signal color.
- `accordion`: sections that open as a group, one or several at a time, with arrow keys between the headers. The grouped counterpart of `disclosure`, which stays the choice for a list of questions that must work without JavaScript.
- `collapsible`: one region shown and hidden by any button, with state the page can control.
- `avatar`: a picture with initials until it loads or when it cannot. It renders a plain `<img>` and fetches nothing of its own.
- `breadcrumb` and `pagination`: named navigation landmarks made of links, with `aria-current="page"` on the current entry.
- `stepper`: progress through a fixed sequence as an ordered list, with `aria-current="step"`.
- `scroll-area`: a scrolling box with thin bars of its own, a tab stop while its content overflows.
- `slider`: a value or a range along a track, with a name on each thumb.
- `input-otp`: a one-time code drawn as boxes over a single real input, so a paste, the code from a message and a screen reader all work.
- `command`: a search field over a keyboard-driven listbox, for command palettes and searchable lists.
- `combobox`: a select with a search field, built from `popover` and `command`.
- `calendar`: a month grid for choosing a day, with the caller's locale and full keyboard navigation. It brings `calendar-date.ts`, helpers for days as text (`"2026-11-10"`).
- `date-picker`: a date field that opens a `calendar` in a `popover`.
- `pricing-card`: one plan on a pricing page, with a featured state that marks the price with the `marker`.
- `theme`: the `expand` and `collapse` animations (`animate-expand`, `animate-collapse`), which open a panel to the height Radix measured.
- A "Navigation" group on the site, and `CHANGELOG.md`.

### Changed

- `utils`: `cn` knows the two new animation names.

### Upgrading from 0.1.0

Nothing that was installed has to change. To use `accordion` or `collapsible`, reinstall `theme` and `utils` as well: without the two animations the panels still open and close, only at once instead of with a motion.

## [0.1.0] - 2026-11-10

The registry as it stood before versions were recorded: 47 items.

### Added

- Foundation: `theme` (color, type, radius and motion tokens in light and dark, and the ink shell), `fonts`, `utils`.
- Brand: `brand-mark`, `marker`.
- Controls: `button`, `input`, `input-group`, `field-message`, `textarea`, `select`, `native-select`, `checkbox`, `radio-group`, `switch`, `toggle`, `toggle-group`, `label`.
- Display: `alert`, `badge`, `card`, `disclosure`, `progress`, `separator`, `skeleton`, `spinner`, `status-label`, `table`.
- Overlays: `alert-dialog`, `confirm-dialog`, `context-menu`, `dialog`, `guarded-dialog`, `dropdown-menu`, `info-hint`, `popover`, `sheet`, `sonner`, `tooltip`.
- Patterns: `copy-button`, `link-row`, `theme-picker`.
- Marketing: `container`, `section-heading`, `text-link`, `icon-tile`, `prose`.
- The site at `ui.abnormalhq.com`, with a page and a Markdown file for every item.
