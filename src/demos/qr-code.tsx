import { QrCode } from "@/components/ui/qr-code";

export const defaultCopy = { walletAddress: "QR code for the wallet address" };

export default function QrCodeDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  const address = "TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE";
  return (
    <figure className="grid justify-items-center gap-3">
      <QrCode value={address} label={copy.walletAddress} />
      <figcaption className="font-mono text-xs text-muted-foreground">{address}</figcaption>
    </figure>
  );
}
