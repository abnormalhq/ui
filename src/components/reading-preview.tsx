"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { BrandMark } from "@/components/ui/brand-mark";
import {
  ItemList,
  ItemListContent,
  ItemListDescription,
  ItemListItem,
  ItemListMeta,
  ItemListRow,
  ItemListTitle,
} from "@/components/ui/item-list";
import { Workspace, WorkspaceNavigation, WorkspacePane } from "@/components/ui/workspace";

const messages = [{ id: "plan" }, { id: "journal" }, { id: "book" }] as const;

/** A working composition example, not a connection to a mailbox. Selection uses the installed list API. */
export function ReadingPreview() {
  const t = useTranslations("Previews");
  const [selected, setSelected] = useState<string>(messages[0].id);
  const message = messages.find(({ id }) => id === selected) ?? messages[0];
  const readerId = useId();
  const headingId = useId();
  return (
    <Workspace>
      <WorkspaceNavigation className="md:w-32">
        <div className="flex items-center gap-2 font-semibold">
          <BrandMark className="size-6" /> {t("mail")}
        </div>
        <p className="rounded-control bg-highlight px-2 py-1.5 font-medium text-highlight-foreground">{t("inbox")}</p>
        <p className="mt-auto text-xs text-muted-foreground">{t("sampleWorkspace")}</p>
      </WorkspaceNavigation>
      <WorkspacePane padding="none" className="md:w-52 md:flex-none">
        <h3 className="px-3 pt-4 pb-3 font-semibold">
          {t("inbox")}{" "}
          <span className="text-xs font-normal text-muted-foreground">
            · {t("messagesCount", { count: messages.length })}
          </span>
        </h3>
        <ItemList aria-label={t("exampleMessages")} className="rounded-none border-0">
          {messages.map((item) => (
            <ItemListItem key={item.id}>
              <ItemListRow asChild density="compact" selected={message.id === item.id}>
                <button
                  type="button"
                  aria-pressed={message.id === item.id}
                  aria-controls={readerId}
                  onClick={() => setSelected(item.id)}
                >
                  <ItemListContent>
                    <ItemListTitle>{t("messages." + item.id + ".sender")}</ItemListTitle>
                    <span className="truncate text-sm">{t("messages." + item.id + ".subject")}</span>
                    <ItemListDescription>{t("messages." + item.id + ".preview")}</ItemListDescription>
                  </ItemListContent>
                  <ItemListMeta className="self-start text-2xs">{t("messages." + item.id + ".time")}</ItemListMeta>
                </button>
              </ItemListRow>
            </ItemListItem>
          ))}
        </ItemList>
      </WorkspacePane>
      <WorkspacePane asChild>
        <article id={readerId} aria-labelledby={headingId} className="min-h-72 gap-4">
          <header className="border-b border-border pb-4">
            <h3 id={headingId} className="font-heading text-xl font-semibold text-pretty wrap-anywhere">
              {t("messages." + message.id + ".subject")}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("from", { sender: t("messages." + message.id + ".sender") })} · {t("messages." + message.id + ".time")}
            </p>
          </header>
          <p className="max-w-prose leading-prose">{t("messages." + message.id + ".body")}</p>
        </article>
      </WorkspacePane>
    </Workspace>
  );
}
