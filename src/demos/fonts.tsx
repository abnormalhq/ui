export const defaultCopy = {
  headings: "Bricolage Grotesque for headings",
  interface: "Inter for everything you read in the interface.",
  codeAndAddresses: "JetBrains Mono for code and addresses",
};

export default function FontsDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <div className="grid w-full gap-5">
      <p className="font-heading text-3xl font-semibold">{copy.headings}</p>
      <p className="font-sans text-lg">{copy.interface}</p>
      <p className="font-mono text-base">{copy.codeAndAddresses}</p>
    </div>
  );
}
