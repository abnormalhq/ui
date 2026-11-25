"use client";

import { useState } from "react";
import {
  CardList,
  CardListCard,
  CardListDot,
  CardListHeader,
  CardListItem,
  CardListLine,
  CardListMeta,
  CardListPreview,
  CardListTitle,
} from "@/components/ui/card-list";

export const defaultCopy = {
  label: "Conversations",
  unread: "Unread",
  renewalFrom: "Cloudflare",
  renewalTime: "09:41",
  renewalSubject: "Your domain renewed",
  renewalPreview: "The invoice went to the billing address. Next renewal in a year.",
  reviewFrom: "Lin Shu",
  reviewTime: "09:12",
  reviewSubject: "Wednesday's review moves to 3 PM",
  reviewPreview: "Hi all, the design review on Wednesday morning moves to the afternoon.",
  mergedFrom: "GitHub",
  mergedTime: "Yesterday",
  mergedSubject: "Pull request merged",
  mergedPreview: "3 commits merged into main.",
};

/* The list sits on the canvas; the selected card is lifted onto the page color. */
export default function CardListDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  const [selected, setSelected] = useState("review");
  const [read, setRead] = useState<string[]>(["merged"]);
  const cards = [
    {
      id: "renewal",
      from: copy.renewalFrom,
      time: copy.renewalTime,
      subject: copy.renewalSubject,
      preview: copy.renewalPreview,
    },
    {
      id: "review",
      from: copy.reviewFrom,
      time: copy.reviewTime,
      subject: copy.reviewSubject,
      preview: copy.reviewPreview,
    },
    {
      id: "merged",
      from: copy.mergedFrom,
      time: copy.mergedTime,
      subject: copy.mergedSubject,
      preview: copy.mergedPreview,
    },
  ];
  return (
    <div className="w-full max-w-xs rounded-panel bg-canvas p-1.5">
      <CardList aria-label={copy.label}>
        {cards.map((card) => (
          <CardListItem key={card.id}>
            <CardListCard asChild selected={selected === card.id} unread={!read.includes(card.id)}>
              <button
                type="button"
                aria-pressed={selected === card.id}
                onClick={() => {
                  setSelected(card.id);
                  setRead((was) => (was.includes(card.id) ? was : [...was, card.id]));
                }}
              >
                <CardListHeader>
                  <CardListDot label={copy.unread} />
                  <CardListTitle>{card.from}</CardListTitle>
                  <CardListMeta>{card.time}</CardListMeta>
                </CardListHeader>
                <CardListLine>{card.subject}</CardListLine>
                <CardListPreview>{card.preview}</CardListPreview>
              </button>
            </CardListCard>
          </CardListItem>
        ))}
      </CardList>
    </div>
  );
}
