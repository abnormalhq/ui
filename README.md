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

Fonts: projects on `next/font` set `--font-inter`, `--font-bricolage` and `--font-jetbrains-mono`, and the theme picks them up. Other projects install `@abnormal/fonts`, import `abnormal-fonts.css` after the theme, and copy the woff2 files from `https://ui.abnormalhq.com/fonts/` into `public/fonts/`: a registry item can only carry text.

Then install components, which bring their own dependencies:

```bash
pnpm dlx shadcn@latest add @abnormal/button @abnormal/dialog
```

## What's in it

| Group      | Items                                                                                                                   |
| ---------- | ----------------------------------------------------------------------------------------------------------------------- |
| Foundation | `theme`, `fonts`, `utils`                                                                                               |
| Brand      | `brand-mark`                                                                                                            |
| Controls   | `button`, `input`, `input-group`, `field-message`, `textarea`, `select`, `native-select`, `checkbox`, `switch`, `label` |
| Display    | `alert`, `badge`, `card`, `disclosure`, `skeleton`, `spinner`, `status-label`, `table`                                  |
| Overlays   | `alert-dialog`, `context-menu`, `dialog`, `dropdown-menu`, `popover`, `sheet`, `sonner`, `tooltip`                      |
| Marketing  | `container`, `section-heading`, `text-link`, `icon-tile`, `prose`                                                       |

## Rules for items

Items stay generic. A component imports only `@/lib/utils`, `@/components/ui/*` and its declared packages: no product code, no `next/*`, and no built-in copy, so anything a user reads comes in through a prop (`closeLabel` on `Dialog` and `Sheet`, required whenever the close button shows). `tests/registry.test.ts` enforces this.

A file that starts with `"use client"` exports components only. A Server Component receives every export of such a file as a client reference, so a class string or helper from it silently stops working there; helpers live in a file without the directive, such as `table-row.ts` next to `table.tsx`.

When editing the theme, keep two things in step, both also tested: the dark values in `:root[data-theme="dark"]` and in the system preference fallback, and any new `--radius-*`, `--shadow-*` or `--animate-*` token with `CN_THEME` in `registry/lib/utils.ts`.

## Develop

```bash
pnpm install
```

```bash
pnpm check
```

The site at `ui.abnormalhq.com` is a Next.js app in `src/`. It renders each item from `registry/` directly, so a change shows up as soon as you save it. Every item needs a demo in `src/demos/<name>.tsx` and a place in `src/groups.ts`; `tests/site.test.ts` enforces both, and each demo's source is also the usage example on its page.

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

## Deploy

The site and the registry share one Cloudflare Worker (`wrangler.jsonc`), served at `ui.abnormalhq.com`. `next build` exports every page to `out/` with the registry JSON and fonts, and all of it is served as static assets, with no Worker code running.

Cloudflare Workers Builds watches `main` and deploys every push. If any step fails nothing is deployed, and the last good version keeps serving. CI runs the same `pnpm cf:build` on pull requests and `main`, and does not publish anything.

Projects keep their own copy of each item, so a deploy changes nothing until a project reinstalls with `--overwrite`.

### Workers Builds settings

Connect `abnormalhq/ui` to the `abnormal-ui` Worker, with `main` as the production branch, `/` as the root directory and builds for other branches turned off:

- Build command: `pnpm install --frozen-lockfile && pnpm cf:build`
- Deploy command: `pnpm cf:deploy`

| Variable                  | Value     | Why                                                  |
| ------------------------- | --------- | ---------------------------------------------------- |
| `PNPM_VERSION`            | `12.16.1` | Matches `packageManager` in `package.json`           |
| `SKIP_DEPENDENCY_INSTALL` | `1`       | Skips the default install in favor of the frozen one |
| `NEXT_TELEMETRY_DISABLED` | `1`       | Turns off Next.js build telemetry                    |
