"use client";

import * as React from "react";
import { CheckIcon, LanguagesIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/** One language the page offers. */
type LanguageOption = {
  /** What the page stores and gets back, such as "en", "zh" or "auto". */
  value: string;
  /** The language's name, best written in that language ("English", "中文"), so it can be found from either. */
  label: string;
  /** The option's own BCP 47 tag, so a screen reader speaks its name in that language. Leave it out for "auto". */
  lang?: string;
  /** For a site with a page per language: the same page in this language, which the option opens as a link. */
  href?: string;
};

type LanguageOptionsProps = {
  options: readonly LanguageOption[];
  /** The current choice. Pass undefined while it is unknown, such as before hydration: no option is checked then. */
  value: string | undefined;
  /** Called with the option chosen; a link option also opens its page. */
  onValueChange?: (value: string) => void;
};

/**
 * The languages as menu radio items, for a menu the page already has, such as the "Language" submenu of an account
 * menu. LanguagePicker wraps them in a button of their own. Each name carries its own `lang`, and an option with
 * `href` is a link (with hreflang) for a site that has a page per language, the current one marked aria-current.
 * It is a client module, as ThemePicker is, since it renders the client menu; a Server Component can still render a
 * picker of links, with no `onValueChange`, and passes it nothing but text.
 */
function LanguageOptions({ options, value, onValueChange }: LanguageOptionsProps) {
  return (
    <DropdownMenuRadioGroup value={value ?? ""} onValueChange={onValueChange}>
      {options.map((option) =>
        option.href === undefined ? (
          <DropdownMenuRadioItem key={option.value} value={option.value} lang={option.lang}>
            {option.label}
          </DropdownMenuRadioItem>
        ) : (
          // A link in the menu, which opens the page in that language; the current one is marked as such, with
          // the check a radio item draws. The handler exists only when the page gave one.
          <DropdownMenuItem
            key={option.value}
            asChild
            className="pr-8"
            onSelect={onValueChange && (() => onValueChange(option.value))}
          >
            <a
              href={option.href}
              hrefLang={option.lang}
              lang={option.lang}
              aria-current={option.value === value ? "true" : undefined}
            >
              {option.label}
              {option.value === value && <CheckIcon aria-hidden="true" className="absolute right-2" />}
            </a>
          </DropdownMenuItem>
        ),
      )}
    </DropdownMenuRadioGroup>
  );
}

type Side = "top" | "right" | "bottom" | "left";

/**
 * The language button of a header or a sidebar's footer: the languages icon, which opens the languages the page
 * offers, with the current one checked. Like ThemePicker it keeps no state: the page passes the current choice and
 * writes the new one back (a cookie, a saved preference), or gives each option the `href` of its page.
 * `label` names the button, such as "Language: English"; `showValue` also writes the current language's name beside
 * the icon, for a page without a user menu where the button has room (sign-in, a status page). `side`, `align` and
 * `tooltip` place the menu and add a tooltip, as on ThemePicker.
 */
function LanguagePicker({
  options,
  value,
  onValueChange,
  label,
  showValue = false,
  side,
  align = "end",
  tooltip,
  tooltipSide,
  onOpenChange,
  variant = "ghost",
  size,
  className,
  ...props
}: LanguageOptionsProps & {
  /** The button's accessible name, such as "Language" or "Language: English". */
  label: string;
  /** Write the current language's name beside the icon. */
  showValue?: boolean;
  side?: Side;
  align?: "start" | "center" | "end";
  /** A tooltip for the button, such as "Language". */
  tooltip?: React.ReactNode;
  tooltipSide?: Side;
  /** The menu opening or closing, for a header that closes its other menus when this one opens. */
  onOpenChange?: (open: boolean) => void;
} & Omit<React.ComponentProps<typeof Button>, "value" | "onChange" | "children" | "aria-label" | "asChild">) {
  const current = options.find((option) => option.value === value);
  const trigger = (
    <DropdownMenuTrigger asChild>
      <Button
        variant={variant}
        size={size ?? (showValue ? "sm" : "icon")}
        aria-label={label}
        className={cn(showValue && "min-w-0", className)}
        {...props}
      >
        <LanguagesIcon />
        {showValue && current && (
          <span lang={current.lang} className="truncate">
            {current.label}
          </span>
        )}
      </Button>
    </DropdownMenuTrigger>
  );
  return (
    <DropdownMenu modal={false} onOpenChange={onOpenChange}>
      {tooltip === undefined || tooltip === null || tooltip === false ? (
        trigger
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>{trigger}</TooltipTrigger>
          <TooltipContent side={tooltipSide}>{tooltip}</TooltipContent>
        </Tooltip>
      )}
      <DropdownMenuContent side={side} align={align} className="min-w-40">
        <LanguageOptions options={options} value={value} onValueChange={onValueChange} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { LanguagePicker, LanguageOptions, type LanguageOption };
