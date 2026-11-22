import { CopyButton } from "@/components/ui/copy-button";

export const defaultCopy = {
  copyAddress: "Copy address",
  copied: "Copied",
  copyFailed: "Copy failed",
  copyInviteLink: "Copy invite link",
  copyLink: "Copy link",
};

export default function CopyButtonDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <div className="flex flex-wrap items-center gap-4">
      <span className="flex items-center gap-1 font-mono text-sm">
        hello@example.com
        <CopyButton
          text="hello@example.com"
          label={copy.copyAddress}
          copiedLabel={copy.copied}
          failedLabel={copy.copyFailed}
        />
      </span>
      <CopyButton
        text="https://example.com/invite/8f3k2"
        label={copy.copyInviteLink}
        copiedLabel={copy.copied}
        failedLabel={copy.copyFailed}
        variant="outline"
      >
        {copy.copyLink}
      </CopyButton>
    </div>
  );
}
