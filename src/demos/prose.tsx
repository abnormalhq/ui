import { Prose } from "@/components/ui/prose";

export default function ProseDemo() {
  return (
    <Prose className="w-full max-w-2xl">
      <h2>What we collect</h2>
      <p>
        Only what the service needs: your <strong>address</strong>, your settings and the <code>Message-ID</code> of
        each message.
      </p>
      <ul>
        <li>Account details</li>
        <li>Billing history</li>
      </ul>
      <h2>How to reach us</h2>
      <p>
        Write to <a href="mailto:hello@example.com">hello@example.com</a>.
      </p>
    </Prose>
  );
}
