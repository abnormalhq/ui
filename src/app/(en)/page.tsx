import { setRequestLocale } from "next-intl/server";
import OverviewPage from "@/site/site-pages/overview";

export default function Page() {
  setRequestLocale("en");
  return <OverviewPage locale="en" />;
}
