export const defaultCopy = {
  headings: "Newsreader and Noto Serif SC for public titles",
  interface: "Inter for everything you read in the interface.",
  codeAndAddresses: "JetBrains Mono for code and addresses",
};

export default function FontsDemo({ copy: overrides = {} }: { copy?: Partial<typeof defaultCopy> } = {}) {
  const copy = { ...defaultCopy, ...overrides };
  return (
    <div className="grid w-full gap-5">
      <p className="font-serif text-3xl font-medium">{copy.headings}</p>
      <p className="font-sans text-lg">{copy.interface}</p>
      <p className="font-mono text-base">{copy.codeAndAddresses}</p>
    </div>
  );
}
