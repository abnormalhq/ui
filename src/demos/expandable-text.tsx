import { ExpandableText } from "@/components/ui/expandable-text";

const message = `Hello,

The migration of your mailboxes finished overnight. Every message, folder and filter came across, and the old server will keep answering for another week in case a device still points at it.

If something looks wrong, reply to this message and we will look at it the same day.

Thanks,
The support team`;

export const defaultCopy = {
  more: "Show more",
  less: "Show less",
  message,
  shortNote: "A short note shows no button.",
};

export default function ExpandableTextDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <div className="grid w-full max-w-md gap-6 text-sm">
      <ExpandableText lines={3} moreLabel={copy.more} lessLabel={copy.less}>
        {copy.message}
      </ExpandableText>
      <ExpandableText moreLabel={copy.more} lessLabel={copy.less}>
        {copy.shortNote}
      </ExpandableText>
    </div>
  );
}
