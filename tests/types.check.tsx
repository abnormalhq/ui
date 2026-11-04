/*
 * Checked by `pnpm typecheck` and never run: each @ts-expect-error fails the check if the line under it compiles,
 * so these pin the props that must stay required.
 */
import { DialogContent, DialogFooter } from "@/components/ui/dialog";
import { SheetContent } from "@/components/ui/sheet";

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
