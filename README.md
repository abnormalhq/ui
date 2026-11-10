# Abnormal UI

The [shadcn registry](https://ui.shadcn.com/docs/registry) behind the Abnormal website, onboard and mail: design tokens, base components and brand pieces, installed as source into each project.

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

| Group      | Items                                                                                                                                                            |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Foundation | `theme`, `fonts`, `utils`                                                                                                                                        |
| Brand      | `brand-mark`                                                                                                                                                     |
| Controls   | `button`, `input`, `input-group`, `field-message`, `textarea`, `select`, `native-select`, `checkbox`, `radio-group`, `switch`, `toggle`, `toggle-group`, `label` |
| Display    | `alert`, `badge`, `card`, `disclosure`, `progress`, `separator`, `skeleton`, `spinner`, `status-label`, `table`                                                  |
| Overlays   | `alert-dialog`, `confirm-dialog`, `context-menu`, `dialog`, `guarded-dialog`, `dropdown-menu`, `info-hint`, `popover`, `sheet`, `sonner`, `tooltip`              |
| Patterns   | `copy-button`, `link-row`, `theme-picker`                                                                                                                        |
| Marketing  | `container`, `section-heading`, `text-link`, `icon-tile`, `prose`                                                                                                |

Patterns are the pieces the projects kept rewriting: they hold no product state (`ThemePicker` takes the saved preference and hands back the choice; `LinkRow` takes the router's `navigate`), and every word they show comes in as a prop.

## Rules for items

Items stay generic. A component imports only `@/lib/utils`, `@/components/ui/*` and its declared packages: no product code, no `next/*`, and no built-in copy, so anything a user reads comes in through a prop (`closeLabel` on `Dialog` and `Sheet`, required whenever the close button shows). That rules out a default or fallback for a label prop (`closeLabel = "Close"`, `closeLabel ?? "Close"`), a literal `aria-label` and literal `sr-only` text. `tests/registry.test.ts` enforces this, and checks every file of an item: an item can bring several, and each one's imports, scoped packages and side-effect imports included, must be declared.

A file with the `"use client"` directive exports components only: PascalCase functions, or `forwardRef`/`memo` of one, and no constants, `cva()` variants, contexts or re-exports. A Server Component receives every export of such a file as a client reference, so a class string or helper from it silently stops working there; helpers live in a file without the directive, such as `table-row.ts` next to `table.tsx` and `use-open-count.ts` next to `guarded-dialog.tsx`. Another item imports such a file by its module name (`@/components/ui/table-row`) and declares the item that brings it (`@abnormal/table`).

When editing the theme, keep two things in step, both also tested: the dark values in `:root[data-theme="dark"]` and in the system preference fallback, and any new `--radius-*`, `--shadow-*` or `--animate-*` token with `CN_THEME` in `registry/lib/utils.ts`.

## Develop

```bash
pnpm install
```

```bash
pnpm check
```

`pnpm check` runs ESLint, the type check and the tests. ESLint uses the rules the projects run on their installed copies (`eslint-config-next` core-web-vitals and TypeScript, so react-hooks and jsx-a11y), so a problem in an item fails here before a project reinstalls it. Commits run lint-staged (ESLint and Prettier on the staged files) and commitlint, as in the website, onboard and mail, and Dependabot proposes dependency updates weekly.

Type checking uses TypeScript 7's `tsc`, like the projects: `@typescript/native` points at TypeScript 7, and `typescript` at the `@typescript/typescript6` compatibility package that Next.js and typescript-eslint load ([the dual-package setup Microsoft recommends](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-6-0)). Keep both aliases when upgrading, so items are checked by the same compiler here and in every project. `tsconfig.json` sets `useDefineForClassFields` to `true` explicitly, as the projects do: tsc and the tests already give class fields define semantics for ES2022, but Next.js's SWC reads only an explicit value and compiles them as assignments otherwise.

Development uses the Node.js in `.node-version`. `engines.node` in `package.json` is the lowest release the toolchain supports (22.22.1, which lint-staged needs; `node --test` on `.ts` needs 22.18), and `tests/toolchain.test.ts` fails when a direct dependency starts to need more.

`pnpm test` builds the registry and the site, then runs `node --test` with `tests/support/register.ts`, which resolves the `@/` aliases and compiles `.tsx` the way a project would. Besides the static checks, `tests/server-render.test.tsx` renders items with no DOM, as a Server Component page would, and `tests/components.test.tsx` mounts the stateful ones in happy-dom and clicks them. `tests/types.check.tsx` is only type-checked: it pins props that must stay required, such as `closeLabel`.

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

| Entry               | Where                                      | Built by                                                          |
| ------------------- | ------------------------------------------ | ----------------------------------------------------------------- |
| Crawl rules         | `/robots.txt`                              | `public/robots.txt`, with Content Signals and the sitemap         |
| Sitemap             | `/sitemap.xml`                             | `src/app/sitemap.ts`                                              |
| Markdown pages      | `/md/index.md`, `/md/components/{name}.md` | `src/app/md/`, exported as files from `src/markdown.ts`           |
| Content negotiation | A page + `Accept: text/markdown`           | `src/worker.ts`, which serves the Markdown file above             |
| Discovery header    | `Link` on every page                       | `src/worker.ts`; on `/` it lists the registry and every component |

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

| Variable                  | Value     | Why                                                  |
| ------------------------- | --------- | ---------------------------------------------------- |
| `PNPM_VERSION`            | `12.16.1` | Matches `packageManager` in `package.json`           |
| `SKIP_DEPENDENCY_INSTALL` | `1`       | Skips the default install in favor of the frozen one |
| `NEXT_TELEMETRY_DISABLED` | `1`       | Turns off Next.js build telemetry                    |
