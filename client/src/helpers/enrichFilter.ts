import type { DiffOptions } from "../calculateDiff";

function enrichFilter(filter: any, idMap: any, options: DiffOptions) {
  if (!filter) return null;
  let jsonString = JSON.stringify(filter);

  // Always run the regex replacement to catch broken references
  jsonString = jsonString.replace(/\{\{(\d+)\./g, (match, id) => {
    if (!idMap[id]) {
      // It's broken: always show the error tag
      return `{{[Broken Reference-${id}].`;
    }
    // It's valid: respect the raw mappings toggle
    return options.showRawMappings ? match : `{{${idMap[id]}.`;
  });

  return JSON.parse(jsonString);
}

export { enrichFilter };
