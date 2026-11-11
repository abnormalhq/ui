# Changelog

All notable changes to the Abnormal UI registry are recorded here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the version is the registry's, in `package.json`, following [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Each entry names the items it touches, because a project installs items one by one and takes a change only when it reinstalls that item. The README's "Versions and updates" section says how.

## [Unreleased]

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
