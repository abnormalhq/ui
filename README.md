# Abnormal UI

The [shadcn registry](https://ui.shadcn.com/docs/registry) behind the Abnormal website and mail: design tokens, base components and brand pieces, installed as source into each project.

## Use it

Add the registry to the project's `components.json`:

```json
{
  "registries": {
    "@abnormal": "https://ui.abnormalhq.com/r/{name}.json"
  }
}
```

Install the theme, and import it once right after Tailwind in the project's CSS entry:

```bash
pnpm dlx shadcn@latest add @abnormal/theme
```

```css
@import "tailwindcss";
@import "./abnormal.css";
```

The theme is written on `<html data-theme="light|dark">`, and follows the system preference until a script has written it. The `dark:` variant follows the same rule as the tokens, so a page with JavaScript off still gets matching `dark:` utilities on a dark system.

The ink shell: a product's navigation column, or the frame around its content, can be the brand ink in both themes, with the content a sheet of paper set into it. Put `ink` on that element and everything inside takes the dark values whatever the page's theme; `dark:` utilities still follow the page, not the shell. `bg-ink` is the color of the frame itself. Paper inside the shell is a sibling of the `ink` element, not a descendant of it.

Fonts: projects on `next/font` set `--font-inter`, `--font-bricolage` and `--font-jetbrains-mono`, and the theme picks them up. Other projects install `@abnormal/fonts`, import `abnormal-fonts.css` after the theme, and copy the woff2 files from `https://ui.abnormalhq.com/fonts/` into `public/fonts/`: a registry item can only carry text.

Then install components, which bring their own dependencies:

```bash
pnpm dlx shadcn@latest add @abnormal/button @abnormal/dialog
```

## What's in it

The [component gallery](https://ui.abnormalhq.com/gallery) groups live variants and their copyable TSX with light and dark color swatches, font families and the type scale. Its registry index links to the demo and source for every item.

| Group      | Items                                                                                                                                                                                                                                                                                                                                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Foundation | `theme`, `fonts`, `utils`, `template`, `workspace`                                                                                                                                                                                                                                                                                                                                                            |
| Brand      | `brand-mark`, `marker`                                                                                                                                                                                                                                                                                                                                                                                        |
| Controls   | `button`, `input`, `input-group`, `search-input`, `password-input`, `file-button`, `field`, `field-message`, `tag`, `textarea`, `select`, `native-select`, `checkbox`, `radio-group`, `switch`, `toggle`, `toggle-group`, `slider`, `input-otp`, `combobox`, `command`, `calendar`, `date-picker`, `date-range-picker`, `date-time-picker`, `toolbar`, `list-toolbar`, `resize-handle`, `label`, `form-reset` |
| Display    | `accordion`, `alert`, `avatar`, `badge`, `banner`, `card`, `code-block`, `collapsible`, `description-list`, `disclosure`, `empty-state`, `expandable-text`, `item-list`, `kbd`, `progress`, `qr-code`, `scroll-area`, `separator`, `skeleton`, `spinner`, `stat`, `status-label`, `status-bar`, `table`, `timeline`, `clip-track`, `truncated-text`, `uptime-bar`                                             |
| Navigation | `tabs`, `breadcrumb`, `pagination`, `stepper`, `page-header`, `skip-link`, `nav-tabs`, `facet-list`, `sidebar`, `side-pane`, `toc`                                                                                                                                                                                                                                                                            |
| Overlays   | `alert-dialog`, `confirm-dialog`, `context-menu`, `dialog`, `guarded-dialog`, `dropdown-menu`, `info-hint`, `popover`, `sheet`, `sonner`, `tooltip`                                                                                                                                                                                                                                                           |
| Patterns   | `copy-button`, `link-row`, `theme-picker`, `theme-script`, `selection-bar`, `list-navigation`, `language-picker`, `turnstile`, `json-ld`                                                                                                                                                                                                                                                                      |
| Marketing  | `container`, `section-heading`, `text-link`, `icon-tile`, `prose`, `pricing-card`, `bento`                                                                                                                                                                                                                                                                                                                    |

Type runs from `text-2xs` (11px) to `text-4xl` (42px) for interfaces, and a display scale on top for marketing pages and the rare large line in a product: `text-display-sm` (34px), `text-display` (40px) and `text-display-lg` (56px), always in the heading face.

Density: the theme reads at a comfortable reading rhythm by default (body 14px, a 4px spacing step, 32px controls). A product people work in for hours over many rows, such as a mail client, an admin console or a desktop app, puts `data-ui-density="compact"` on `<html>` (or on one region). With a mouse or trackpad (touch screens keep the default, so touch targets keep their size), the spacing step drops to 3.5px, so every padding, gap and component height built on it shrinks by an eighth (a 32px button is 28px), the interface type steps down about 1px (body 13px, page title 24px) and line heights close to 1.45. `text-2xs`, the display scale, radii and fixed pixel values stay as they are. Handwritten CSS joins in by writing its lengths as `--spacing(n)` and its sizes as `var(--text-*)`.

The brand speaks through three marks, and each has its place. `Marker` is a highlighter stroke under a number or a single word, never a sentence, once on a screen. `HeadingMark` (in `section-heading`) is the signal-colored full stop that ends a page title or the title of an empty state, not a panel, dialog or error title. `BrandArrow` (in `brand-mark`) ends a link that leaves for another product or another site; everything else keeps the interface icons. The offset shadow behind the "a" belongs to the mark alone.

Three items open and close content, and each has its case. `disclosure` is a native `<details>`: a list of questions on a page, working without JavaScript and sending none to the page (before this release its plus icon came from `lucide-react`, which brought a client script with it). `accordion` is a group of sections with one open at a time, arrow keys between the headers and state the page can control. `collapsible` is one region wired to any button and to the page's own state.

Dates are text, not `Date` objects: `calendar` and `date-picker` take and return `"2026-11-10"`, the form `<input type="date">` submits, so a day is the same day on the server and in every time zone. A range is two of them, `{ from, to }`: `calendar` with `mode="range"`, and `date-range-picker`, which submits the pair as two form fields. All three take the `locale` from the page and never assume one.

Fields that hold their value in React state (`switch`, `combobox`, `date-picker`, `date-range-picker`, `date-time-picker`, `input-otp`) follow their form like native ones: a reset puts an uncontrolled field back on its default, with or without a `name` and disabled or not, and a reset the page cancels (`event.preventDefault()` in `onReset`) leaves it alone. They share `useFormReset` from `form-reset`, which a project's own field can call too.

The theme needs something to keep the visitor's choice. A page with its own provider (next-themes, a cookie the server reads) passes that to `ThemePicker`; a page without one renders `ThemeScript` once in `<head>`, an inline script that applies the saved or system theme before the first paint and follows the system and other tabs, and gives `ThemePicker` the `[preference, setPreference]` of `useThemePreference`. This site does the latter.

Copy strings with slots, such as a sentence holding two links, are `Template<"terms" | "privacy">` strings from `template`: `fillTemplate` swaps each `{name}` for its part, and the type makes the compiler check that a component passes exactly the slots its copy declares.

Patterns are the pieces the projects kept rewriting: they hold no product state (`ThemePicker` takes the saved preference and hands back the choice; `LinkRow` takes the router's `navigate`), and every word they show comes in as a prop.

## Family style and workspace compositions

The family direction is **paper-like tool minimalism**: warm paper, ink structure and a restrained yellow highlighter. Keep the existing palette and type; share visual rules without forcing the website, Mail, Doppel and Status into the same layout. The [family guide](https://ui.abnormalhq.com/design) contains the palette's roles, type hierarchy, density and responsive rules, and working composition examples. Agents can read the same contract at [/md/design.md](https://ui.abnormalhq.com/md/design.md).

`workspace` supplies the ink frame and paper surfaces without adding product state:

```tsx
<Workspace>
  <WorkspaceNavigation className="md:w-52">
    <nav aria-label={messages.navigationLabel}>{navigation}</nav>
  </WorkspaceNavigation>
  <WorkspacePane padding="compact">{list}</WorkspacePane>
  <WorkspacePane asChild>
    <article aria-labelledby="message-title">{reader}</article>
  </WorkspacePane>
</Workspace>
```

The navigation and panes must be siblings: only the navigation carries `ink`, so light paper does not inherit dark tokens. `Workspace` stacks on small screens and hides nothing. The product owns collapse / back behavior, pane widths, height, scroll boundaries and landmarks. For the existing collapsible `Sidebar`, put it inside `WorkspaceNavigation className="p-0"`; do not give the wrapper a fixed width, so the sidebar can collapse normally. Status and marketing pages need not use an ink frame at all.

`WorkspacePane` padding is local (`none`, `compact`, `comfortable`, default `comfortable`). A compact list can sit beside a comfortable reader without shrinking either one's controls. `ItemListRow` separately accepts `density="compact"` (default `comfortable`, unchanged spacing) and `selected` for the muted-highlight row. Supply the matching semantics on the child: `aria-current` for a current link or `aria-pressed` for a toggle button. Saturated `highlight` remains for the current navigation item or a new signal; success / warning / failure keep their semantic colors and visible words.

Install `@abnormal/workspace` and reinstall `@abnormal/item-list` only where these new opt-in pieces are needed, using the update procedure below. The theme and existing component defaults do not need to change. The site examples use sample data; they do not connect to or replace any product's screens.

## Versions and updates

The registry has one version, in `package.json`, and [CHANGELOG.md](CHANGELOG.md) lists what each version added, changed or removed, item by item. A new item or a compatible change is a minor version, a fix is a patch, and a change a project has to adapt to (a renamed or newly required prop, a removed item or token) is a major version once the registry reaches 1.0, and a minor version called out under "Changed" or "Removed" until then.

The registry is served at its latest version only: `https://ui.abnormalhq.com/r/{name}.json` is always the newest item, and there are no per-version URLs. A project pins a version by what it has committed, since every item is installed as source into the project's own repository.

To take an update, read the changelog entries since the project last installed, then reinstall the items it names and review the result as any other diff:

```bash
pnpm dlx shadcn@latest add @abnormal/button @abnormal/dialog --overwrite
git diff
```

`--overwrite` replaces the project's copy, local edits included, so the diff is where those are restored. Name every item an entry mentions in the same command, `theme` and `utils` included when it says an item needs a newer one. An item nobody reinstalls keeps working as it was.

To see what has drifted, a project can call this repository's reusable workflow, which dry-runs every item against the project's `components.json` and fails on each file that differs from the registry's current item, whether it was edited by hand or not reinstalled since a release. Run it on a schedule or by hand, not on each pull request, since every release makes it fail until the project takes it:

```yaml
jobs:
  registry:
    uses: abnormalhq/ui/.github/workflows/registry-drift.yml@main
    with:
      working-directory: . # where components.json is
```

## Rules for items

Items stay generic. A component imports only `@/lib/utils`, `@/components/ui/*` and its declared packages: no product code, no `next/*`, and no built-in copy, so anything a user reads comes in through a prop (`closeLabel` on `Dialog` and `Sheet`, required whenever the close button shows). That rules out a default or fallback for a label prop (`closeLabel = "Close"`, `closeLabel ?? "Close"`), a literal `aria-label` and literal `sr-only` text. The same goes for a locale: `calendar`, `date-picker` and `date-range-picker` require one. `tests/registry.test.ts` enforces this, and checks every file of an item: an item can bring several, and each one's imports, scoped packages and side-effect imports included, must be declared.

An item adds a package only when the behavior cannot reasonably be owned here. Each declared package must also be a dependency of this site at the same version floor, so it is installed, built and tested here (`tests/registry.test.ts`), and its Node.js floor counts toward `engines.node` (`tests/toolchain.test.ts`). `command`, `combobox`, `input-otp`, `calendar`, `date-picker` and `date-range-picker` were written without `cmdk`, `input-otp` or `react-day-picker` for that reason: Radix, the popover and `Intl` already cover them, and a package would have brought its own labels or its own locale data.

A file with the `"use client"` directive exports components only: PascalCase functions, or `forwardRef`/`memo` of one, and no constants, `cva()` variants, contexts or re-exports. A Server Component receives every export of such a file as a client reference, so a class string or helper from it silently stops working there; helpers live in a file without the directive, such as `table-row.ts` next to `table.tsx` and `use-open-count.ts` next to `guarded-dialog.tsx`. Another item imports such a file by its module name (`@/components/ui/table-row`) and declares the item that brings it (`@abnormal/table`). A helper several items share is an item of its own, so each of them declares it and the CLI installs it with them: `form-reset` brings `use-form-reset.ts`.

A file without the directive stays a server module, so a page made only of such items ships no client JavaScript. It imports neither `lucide-react`, whose 1.x `Icon` is a client module, nor an item with the directive, directly or through another item; `tests/registry.test.ts` checks both. Its icons are drawn inline with lucide's paths, size and stroke and `aria-hidden`, as in `disclosure`, `breadcrumb`, `pagination`, `stepper`, `pricing-card`, `banner`, `page-header`, `stat`, `item-list` and `tag`, and it takes any other icon as children. `label` is a client module (Radix's `Label`), so a page that must ship no client JavaScript labels its fields with a native `<label>`, given the same classes if it should look the same.

When editing the theme, keep two things in step, both also tested: the dark values in `:root[data-theme="dark"]` and in the system preference fallback, and any new `--radius-*`, `--shadow-*` or `--animate-*` token with `CN_THEME` in `registry/lib/utils.ts`.

## Develop

Development pins Node.js 26.13.1 in `.node-version` and pnpm 12.21.0 in `packageManager`. `engines.node` remains the declared compatibility floor (`>=22.22.1`), not the development pin. `tests/toolchain.test.ts` validates dependency engine declarations; this rollout was exercised on Node 26.13.1.

Node 26 does not bundle Corepack. Install stable Corepack 0.36.0 into the selected Node installation, then use it to install the manager declared by `packageManager`.

```bash
nvm install 26.13.1
nvm use 26.13.1
npm install --global corepack@0.36.0
corepack enable
corepack install
pnpm --version # 12.21.0
pnpm install --frozen-lockfile
```

```bash
pnpm check
```

`pnpm check` runs ESLint, the type check and the tests. ESLint uses the rules the projects run on their installed copies (`eslint-config-next` core-web-vitals and TypeScript, so react-hooks and jsx-a11y), so a problem in an item fails here before a project reinstalls it. Commits run lint-staged (ESLint and Prettier on the staged files) and commitlint, as in the website and mail, and Dependabot proposes dependency updates weekly.

GitHub's [supported-ecosystem documentation](https://docs.github.com/en/code-security/reference/supply-chain-security/supported-ecosystems-and-repositories) warns that pnpm 12's default two-document lockfile prevents dependency-graph alerts and security updates (version PRs still work). The [pnpm lockfile documentation](https://pnpm.io/lockfile) describes `pmOnFail: ignore` as the one-document option. In `pnpm-workspace.yaml` it keeps this lockfile to one document. It disables pnpm's manager self-bootstrap, so Corepack selects the manifest pin locally and `pnpm/action-setup` reads the same pin in CI.

Type checking uses TypeScript 7.0.2's `tsc`, like the projects: `@typescript/native` points at TypeScript 7, while `typescript` aliases `@typescript/typescript6` 6.0.2, the latest TypeScript 6 API compatibility package loaded by Next.js and typescript-eslint ([Microsoft's dual-package guidance](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-6-0)). The test loader calls `transpileModule`, so keep this alias on TypeScript 6; Dependabot allows its patch/minor updates but ignores major updates. Keep both aliases when upgrading, so items are checked by the same compiler here and in every project. `tsconfig.json` sets `useDefineForClassFields` to `true` explicitly, as the projects do: tsc and the tests already give class fields define semantics for ES2022, but Next.js's SWC reads only an explicit value and compiles them as assignments otherwise.

`pnpm test` builds the registry and the site, then runs `node --test` with `tests/support/register.ts`, which resolves the `@/` aliases and compiles `.tsx` the way a project would. Besides the static checks, `tests/server-render.test.tsx` renders items with no DOM, as a Server Component page would, and `tests/components*.test.tsx` mount the stateful ones in happy-dom, click them and press their keys (`components-layout` for tabs, accordions and the like, `components-pickers` for the fields that choose a value). `tests/types.check.tsx` is only type-checked: it pins props that must stay required, such as `closeLabel`, a landmark's `label`, a calendar's `locale` and the `thumbLabels` of a range slider.

The site at `ui.abnormalhq.com` is a Next.js app in `src/`. It renders each item from `registry/` directly, so a change shows up as soon as you save it. Every item needs a demo in `src/demos/<name>.tsx` and a place in `src/groups.ts`; `tests/site.test.ts` enforces both, and each demo's source is also the usage example on its page. The page also reads the item's source: the block comments at the top level become its design notes, and the `variants` of each `cva()` call become its variants table (`src/notes.ts`), so the reasoning in a comment reaches the page and the Markdown without being written twice.

```bash
pnpm dev
```

`pnpm build:registry` writes each item to `public/r/` (ignored by git). To try a change in a project before publishing, run the registry locally and point the project's `components.json` at it:

```bash
pnpm serve
```

```json
{ "registries": { "@abnormal": "http://localhost:4341/r/{name}.json" } }
```

## For agents

Checked against the content-site items on [Is Your Site Agent-Ready](https://isitagentready.com/), which you can re-run with `POST https://isitagentready.com/api/scan`.

| Entry               | Where                                      | Built by                                                                                 |
| ------------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------- |
| Crawl rules         | `/robots.txt`                              | `public/robots.txt`, with Content Signals and the sitemap                                |
| Sitemap             | `/sitemap.xml`                             | `src/app/sitemap.ts`                                                                     |
| Index               | `/llms.txt`                                | `src/app/llms.txt/route.ts`, from `llmsTxt` in `src/markdown.ts`                         |
| Markdown pages      | `/md/index.md`, `/md/components/{name}.md` | `src/app/md/`, exported as files from `src/markdown.ts`                                  |
| Content negotiation | A page + `Accept: text/markdown`           | `src/worker.ts`, which serves the Markdown file above                                    |
| Discovery header    | `Link` on every page                       | `src/worker.ts`: its Markdown and llms.txt; on `/` also the registry and every component |

`Content-Signal` is `search=yes, ai-input=yes, ai-train=no`, the same as the website.

Static assets can't vary on a request header, so negotiation needs the Worker. `pnpm dev` has no Worker: use `pnpm serve` to try these two.

## Deploy

The site and the registry share one Cloudflare Worker (`wrangler.jsonc`), served at `ui.abnormalhq.com`. `next build` exports every page to `out/` with the registry JSON and fonts, and all of it is served as static assets. The Worker runs only on `/` and `/components/*`, and only chooses which file to serve: it never renders.

Cloudflare Workers Builds watches `main` and deploys every push. If any step fails nothing is deployed, and the last good version keeps serving. CI runs the same `pnpm cf:build` on pull requests and `main`, and does not publish anything.

Projects keep their own copy of each item, so a deploy changes nothing until a project reinstalls with `--overwrite`.

### Workers Builds settings

Connect `abnormalhq/ui` to the `abnormalhq-ui` Worker, with `main` as the production branch, `/` as the root directory and builds for other branches turned off:

- Build command: `pnpm install --frozen-lockfile && pnpm cf:build`
- Deploy command: `pnpm cf:deploy`

| Variable                  | Value | Why                                                  |
| ------------------------- | ----- | ---------------------------------------------------- |
| `SKIP_DEPENDENCY_INSTALL` | `1`   | Skips the default install in favor of the frozen one |
| `NEXT_TELEMETRY_DISABLED` | `1`   | Turns off Next.js build telemetry                    |

The pnpm version comes from `packageManager` in `package.json`: Workers Builds reads it before any `PNPM_VERSION` build variable, so none is set.

## License

The code and the registry items are under the [MIT License](LICENSE). The fonts in `public/fonts` (Bricolage Grotesque, Inter, JetBrains Mono) keep their own SIL Open Font License, and the Abnormal name and logo are not licensed for reuse.
