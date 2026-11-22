import { Prose } from "@/components/ui/prose";

export const defaultCopy = {
  collect: "What we collect",
  onlyNeeded: "Only what the service needs: your",
  address: "address",
  settingsAnd: ", your settings and the",
  eachMessage: " of each message.",
  accountDetails: "Account details",
  billingHistory: "Billing history",
  retention: "How long we keep it",
  what: "What",
  for: "For",
  trash: "Mail in Trash",
  thirtyDays: "30 days",
  deliveryLogs: "Delivery logs",
  ninetyDays: "90 days",
  deletion: "Deleting an account removes its mail from every server within a day.",
  contact: "How to reach us",
  writeTo: "Write to",
};

export default function ProseDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <Prose className="w-full max-w-2xl">
      <h2>{copy.collect}</h2>
      <p>
        {copy.onlyNeeded} <strong>{copy.address}</strong>
        {copy.settingsAnd} <code>Message-ID</code>
        {copy.eachMessage}
      </p>
      <ul>
        <li>{copy.accountDetails}</li>
        <li>{copy.billingHistory}</li>
      </ul>
      <h2>{copy.retention}</h2>
      <table>
        <thead>
          <tr>
            <th>{copy.what}</th>
            <th>{copy.for}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{copy.trash}</td>
            <td>{copy.thirtyDays}</td>
          </tr>
          <tr>
            <td>{copy.deliveryLogs}</td>
            <td>{copy.ninetyDays}</td>
          </tr>
        </tbody>
      </table>
      <blockquote>
        <p>{copy.deletion}</p>
      </blockquote>
      <pre>
        <code>{`curl https://api.example.com/v1/export \
  -H "Authorization: Bearer $TOKEN"`}</code>
      </pre>
      <hr />
      <h2>{copy.contact}</h2>
      <p>
        {copy.writeTo} <a href="mailto:hello@example.com">hello@example.com</a>.
      </p>
    </Prose>
  );
}
