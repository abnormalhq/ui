/*
 * Checked by `pnpm typecheck` and never run: each @ts-expect-error fails the check if the line under it compiles,
 * so these pin the props that must stay required.
 */
import { AvatarImage } from "@/components/ui/avatar";
import { Breadcrumb, BreadcrumbEllipsis } from "@/components/ui/breadcrumb";
import { Calendar } from "@/components/ui/calendar";
import { Combobox } from "@/components/ui/combobox";
import { CommandInput } from "@/components/ui/command";
import { DatePicker } from "@/components/ui/date-picker";
import { DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Pagination, PaginationEllipsis } from "@/components/ui/pagination";
import { SheetContent } from "@/components/ui/sheet";
import { StepperItem } from "@/components/ui/stepper";

declare const maybe: boolean;

export const closeLabels = [
  // @ts-expect-error The close button shows by default, so it needs a translated name.
  <DialogContent key="default" />,
  <DialogContent key="named" closeLabel="关闭" />,
  <DialogContent key="hidden" showCloseButton={false} />,
  // @ts-expect-error A flag that may be true needs the name as well.
  <DialogContent key="flag" showCloseButton={maybe} />,
  <DialogContent key="flag-named" showCloseButton={maybe} closeLabel="Close" />,
  <DialogFooter key="footer" />,
  // @ts-expect-error The footer's close button needs a name once it shows.
  <DialogFooter key="footer-shown" showCloseButton />,
  <DialogFooter key="footer-named" showCloseButton closeLabel="取消" />,
  // @ts-expect-error The sheet's close button always shows.
  <SheetContent key="sheet" />,
  <SheetContent key="sheet-named" closeLabel="Close" />,
];

/** The items added in 0.2.0 have no words of their own either: every name a screen reader speaks is required. */
export const names = [
  // @ts-expect-error The landmark needs a name.
  <Breadcrumb key="breadcrumb" />,
  <Breadcrumb key="breadcrumb-named" label="Breadcrumb" />,
  // @ts-expect-error The dots stand for something, and must say what.
  <BreadcrumbEllipsis key="breadcrumb-ellipsis" />,
  // @ts-expect-error The landmark needs a name.
  <Pagination key="pagination" />,
  <Pagination key="pagination-named" label="Pagination" />,
  // @ts-expect-error The gap must say what it stands for.
  <PaginationEllipsis key="pagination-ellipsis" />,
  // @ts-expect-error A picture needs an alt, even an empty one.
  <AvatarImage key="avatar" src="/ada.png" />,
  <AvatarImage key="avatar-decorative" src="/ada.png" alt="" />,
  // @ts-expect-error A placeholder is not a name.
  <CommandInput key="command" placeholder="Type a command" />,
  <CommandInput key="command-named" label="Search commands" />,
  // @ts-expect-error The search field and the popover need a name.
  <Combobox key="combobox" options={[]} placeholder="Choose" emptyMessage="None" />,
  // @ts-expect-error What an empty search says is the page's to word.
  <Combobox key="combobox-empty" options={[]} placeholder="Choose" searchLabel="Search" />,
  <Combobox key="combobox-named" options={[]} placeholder="Choose" searchLabel="Search" emptyMessage="None" />,
  // @ts-expect-error The month buttons need names.
  <Calendar key="calendar" locale="en-GB" />,
  // @ts-expect-error The locale is the page's, never a default.
  <Calendar key="calendar-locale" previousLabel="Previous month" nextLabel="Next month" />,
  <Calendar key="calendar-named" locale="en-GB" previousLabel="Previous month" nextLabel="Next month" />,
  // @ts-expect-error The popover needs a name.
  <DatePicker key="date" locale="en-GB" placeholder="Choose" previousLabel="Previous" nextLabel="Next" />,
  <DatePicker
    key="date-named"
    locale="en-GB"
    placeholder="Choose"
    calendarLabel="Choose a date"
    previousLabel="Previous"
    nextLabel="Next"
  />,
  // @ts-expect-error A step has a status.
  <StepperItem key="step" />,
  <StepperItem key="step-current" status="current" />,
];
