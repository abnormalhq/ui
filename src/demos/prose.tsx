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
      <h2>How long we keep it</h2>
      <table>
        <thead>
          <tr>
            <th>What</th>
            <th>For</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Mail in Trash</td>
            <td>30 days</td>
          </tr>
          <tr>
            <td>Delivery logs</td>
            <td>90 days</td>
          </tr>
        </tbody>
      </table>
      <blockquote>
        <p>Deleting an account removes its mail from every server within a day.</p>
      </blockquote>
      <pre>
        <code>{`curl https://api.example.com/v1/export \
  -H "Authorization: Bearer $TOKEN"`}</code>
      </pre>
      <hr />
      <h2>How to reach us</h2>
      <p>
        Write to <a href="mailto:hello@example.com">hello@example.com</a>.
      </p>
    </Prose>
  );
}
