# Changelog

All notable changes to the Abnormal UI registry are recorded here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the version is the registry's, in `package.json`, following [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Each entry names the items it touches, because a project installs items one by one and takes a change only when it reinstalls that item. The README's "Versions and updates" section says how.

## [Unreleased]

### Added

- `empty-state`: what a list, a search or a page shows when it has nothing to show: an icon in a tile, a title, a sentence and the next steps. `default` is the large centered block that stands in for a whole list; `compact` the dashed box for one panel among others. The title is a paragraph unless `asChild` makes it the heading the outline needs.
- `page-header`: the top of a product page: the h1, an ⓘ or a line saying what the page is for, the page's actions at 32px, and `PageHeaderBack`, a link back to the parent page (or a `breadcrumb` in its place). `sticky` keeps it at the top on an opaque background, and draws its line while the page sets `data-stuck`.
- `description-list`: names and their values in a `dl`, the values starting on one line (`auto minmax(0,1fr)`), as a bare list, a tinted `panel`, or `spread` rows for a receipt. `DescriptionDetails` takes an `action` beside the value, such as a `CopyButton`.
- `timeline`: events in order on a rail, each marked by a dot in its tone or, given `icon`, a round tile, with `TimelineTitle`, `TimelineTime` (a `<time>`) and `TimelineContent`. The list is named by the page.
- `banner`: a strip across the top of a page or pane about the state of the whole thing (offline, an auto-reply that is on, maintenance), in five tones, with `BannerText`, `BannerMeta`, `BannerAction` and `BannerClose`, a dismiss button named by `label`. A status region unless given `role="alert"`.
- `stat`: the headline numbers of a page: `StatGrid`, a `dl` of tiles or of `joined` cells, two to a row on a phone and up to `columns`; `Stat` with a label and a value; `StatHint`; and `StatDelta`, the change, with a direction arrow and a tone that says whether it is good news.
- `kbd`: `Kbd`, a key cap in two sizes, and `KbdCombo`, keys pressed together. `use-modifier-key.ts` brings `useModifierKey`, which tells a Mac's ⌘ from Control after hydration and leaves the printed name to the page.
- `selection-bar`: the toolbar above a list that acts on the rows checked in it: a select-all checkbox that shows none, some or all, the count in the page's words (also a status region), the actions while something is checked, and a clear button. While nothing is checked, `idle` can take the count's place, such as the list's filter tabs.
- `item-list`: a short bordered list with a line between rows; `ItemListRow` is plain, or a whole-row link or button with `asChild`, with a title, a description, `ItemListMeta` and `ItemListChevron`.
- `field`: `Field` wires a `FieldLabel`, the control in a `FieldControl` and a `FieldHint` together (`htmlFor`, `aria-describedby`, `aria-invalid`). `error` makes the control invalid and shows in the hint's place, announced at once. `orientation="row"` is the bordered setting row, and `SwitchField` that row with a `Switch`.
- `tag`: a chip for a chosen value with an × button named by `removeLabel`, and `TagList` to hold them.
- `truncated-text`: a line cut with an ellipsis, or a few with `line-clamp-*`, that shows the whole text in a tooltip only when it was cut.
- `expandable-text`: a long text clamped to `lines`, with a show more / show less button (`moreLabel`, `lessLabel`) only when it runs past them, measured again when its width changes.
- `uptime-bar`: `UptimeBar`, a strip of up, degraded, down and empty bars, each with its native tooltip, named as one image and drawn with no script; `UptimeValue`, the uptime in its color; and `uptimeStatus`, a bucket's status from its counts.
- `code-block`: a `pre` that scrolls sideways and takes focus, with an optional header naming it and a `CopyButton` that copies the code beside it, so the code reaches the page once.
- `qr-code`: a QR code drawn as inline SVG on the server, dark on white in both themes, named as an image. It brings `uqr`, the encoder the storefront already uses: a QR encoder is not something to own here.
- `skip-link`: the first link on a page, above the top edge until it takes the keyboard focus.
- `sidebar`: an app's column that collapses to a 64px icon rail and expands to 248px rows: `SidebarHeader`, `SidebarNav` (a landmark named by `label`), `SidebarSeparator`, `SidebarFooter`, `SidebarToggle`, and `SidebarItem`, a row with an icon, a name, a `count` read as `countLabel`, `attention` and a `dot`, a button or, with `asChild`, the router's link. On the rail the name and count move to a tooltip and stay in the row's name. The state is the sidebar's or the page's (`collapsed`, `onCollapsedChange`); `cookieName` writes it to a cookie the server can read into `defaultCollapsed`, and `shortcut` toggles it with ⌘ or Ctrl, not while typing. `SidebarProvider` shares the state with things outside the column, and `use-sidebar.ts` brings `useSidebar` for a project's own rows.
- `nav-tabs`: tabs made of links, for views with their own address: `NavTabs`, a landmark named by `label`, and `NavTab`, a link or with `asChild` the router's, marked with `aria-current` (`"page"`, or `"location"` for a section of the page). Three looks: `underline`, `pill` and `segmented`. The row scrolls sideways without a scrollbar, fades its cut-off edges, takes a vertical wheel and brings the current tab into view when it changes.
- `toolbar`: `Toolbar`, `role="toolbar"` named by `label`, with one tab stop and the arrow keys, Home and End between its controls, past disabled and hidden ones; `ToolbarGroup`, `ToolbarSeparator`, `ToolbarButton` (ghost, icon-sized, a toggle with `pressed`) and `ToolbarItem` for a select or a menu trigger.
- `resize-handle`: `ResizeHandle`, a focusable `role="separator"` named by `label` that sets a pane's width (`orientation="vertical"`) or height (`"horizontal"`): a pointer drag, the arrow keys by `step`, Home and End to `min` and `max`, and a double-click for `onReset`. `onValueChange` follows each move and `onValueCommit` comes once, to save. `use-pointer-drag.ts` brings `usePointerDrag`, the drag with pointer capture, for a handle of a project's own.
- `toc`: a table of contents beside a document: `Toc`, a landmark named by `label` that marks the section being read with `aria-current="location"` as the page scrolls, measured against the page's `scroll-padding-top` and each heading's `scroll-margin-top`; `TocTitle`, `TocList` and `TocLink` with a `level`. The links render on the server and work without a script.
- `language-picker`: `LanguagePicker`, the languages button and menu, and `LanguageOptions` for a menu the page already has. Like `theme-picker` it holds no state: the page passes the current language and writes back the choice, or gives each option the `href` of its page (with `hreflang`). Each name carries its own `lang`; `showValue` writes the current one beside the icon; `tooltip`, `side` and `align` as on `theme-picker`.
- `date-time-picker`: a day and a time of day in one field, a `date-picker` and the browser's time input, valued as `"2026-11-10T09:30"`, the text `<input type="datetime-local">` submits. It is empty until both halves are set; `defaultTime` fills the time when a day comes first; `min` and `max` hold the calendar to their days and the time to their times; `name` submits it as one field, and a form reset puts it back.
- `file-button`: a `Button` that opens a hidden file input (`accept`, `multiple`, `capture`) and hands the files to `onFiles`, emptying the input so the same file can be chosen again; with a `name` the input keeps them and submits with its form.
- `password-input`: an `InputGroup` password field with a show and hide button named by `showLabel` and `hideLabel`, an eye icon or with `toggle="text"` the words, `visible` for a page that holds the state, and `actions` for more buttons such as generate. A form reset hides the password again.
- `turnstile`: Cloudflare Turnstile for a form: `useTurnstile` (in `use-turnstile.ts`) loads the script once per page, renders the widget in the page's theme, writes the token into a hidden field (`fieldName`), and gives `status`, `waiting`, `token()`, `reset()` and `guard`, which stops a submission that comes before the token. `Turnstile` is the same as a component, with `resetKey`. A failed check leaves the decision to the server.
- `json-ld`: `JsonLd`, a page's structured data as a native `<script type="application/ld+json">`, and `serializeJsonLd`, the JSON with every `<` escaped so a value cannot end the element.

### Changed

- `badge`: a `size`, with `sm` the 20px chip for a dense row. `BadgeCount` is a number in a round chip, capped at `max` with a plus ("99+") and hidden at zero; `BadgeDot` a dot that says there is something new, decoration unless given a `label`. Badges without `size` are as before.
- `text-link`: `variant="inline"`, the link inside a sentence: the foreground color with a faint underline that deepens on hover. Now needs `class-variance-authority`.
- `prose`: styles for code blocks, tables, block quotes and rules, for documentation rendered from Markdown. A table scrolls sideways inside the column instead of widening the page.
- `pricing-card`: `discount`, the offer as a chip under the price, and `originalPrice` with `originalPriceLabel`, the price before it, struck through and read out first by a screen reader.
- `progress`: `tone`, `warning` or `destructive`, for a usage meter near or at its limit.
- `sheet`: `SheetClose`, and `SheetPanel`, the bare portalled panel for a sheet that places and styles itself.
- `table`: `SortableHead`, a header cell whose link sorts the list on the server, with `aria-sort` and an arrow for the direction. Now needs `lucide-react` and `radix-ui`.
- `copy-button`: `text` is optional. Without it the button copies the code beside it when pressed: the text of the first `<code>` (else `<pre>`) in its parent, with each `<br>` read as a line break, so a code block rendered on the server sends its source once instead of again as a prop. With nothing beside it the copy fails as a refused clipboard does. Buttons that pass `text` work as before.
- `copy-button`: without `write`, a page with no Clipboard API (one served over plain HTTP, such as an internal address) or one whose clipboard refuses now copies the older way, by selecting the text in a hidden textarea next to the button and calling `execCommand("copy")`; the focus goes back to the button. It reports a failure only when that fails too.
- `scroll-area`: `fade` fades the edges that have more content past them, and `strip` makes a one-line row that scrolls sideways, a vertical mouse wheel included. `use-scroll-fade.ts` brings the two hooks behind them, `useScrollFade` and `useWheelSideways`, for a row of a project's own.
- `tabs`: `TabsList` takes `variant="pill"`, the tabs as pills with the current one in the highlighter and no hairline, for the sections of a settings panel or tabs inside a card.
- `sonner`: a `className`, `style`, `icons` or `toastOptions` given to `Toaster` now adds to the toaster's own instead of replacing it, and `toastOptions.classNames.toast` joins `cn-toast`, so a page no longer has to repeat that class.
- `theme-picker`: `tooltip` and `tooltipSide` add a tooltip to the button, and `side` places the menu, for a sidebar's footer. With `value` undefined the button now shows the sun or the moon for the theme the page is painted in, instead of the system icon, so no wrong icon shows before the preference is known. Now needs `tooltip`.

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
