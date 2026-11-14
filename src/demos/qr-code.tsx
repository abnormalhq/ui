import { QrCode } from "@/components/ui/qr-code";

export default function QrCodeDemo() {
  const address = "TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE";
  return (
    <figure className="grid justify-items-center gap-3">
      <QrCode value={address} label="QR code for the wallet address" />
      <figcaption className="font-mono text-xs text-muted-foreground">{address}</figcaption>
    </figure>
  );
}
