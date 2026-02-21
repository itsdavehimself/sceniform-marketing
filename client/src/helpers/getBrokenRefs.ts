const BROKEN_REF_REGEX =
  /\[(?:Unknown|Missing Reference|Broken Reference)-(\d+)\]/g;

const getBrokenRefs = (value: any): string[] => {
  if (!value) return [];
  const str = typeof value === "object" ? JSON.stringify(value) : String(value);
  const matches = [...str.matchAll(BROKEN_REF_REGEX)];
  return Array.from(new Set(matches.map((m) => m[1])));
};

export { getBrokenRefs };
