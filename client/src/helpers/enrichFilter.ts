// enrichFilter.ts
import type { DiffOptions } from "../calculateDiff";

function enrichFilter(node: any, idMap: any, options: DiffOptions) {
  if (!node || !node.filter) return null;

  // 1. Build the dictionary of Field IDs (e.g., fldXYZ) to Labels
  const fieldDict: Record<string, string> = {};
  const restoreExpect = node.metadata?.restore?.expect || {};
  const nodeExpect = node.metadata?.expect || [];

  const findSpecs = (obj: any) => {
    if (!obj || typeof obj !== "object") return;
    if (Array.isArray(obj)) {
      obj.forEach(findSpecs);
    } else {
      if (Array.isArray(obj.spec)) {
        obj.spec.forEach((field: any) => {
          if (field.name && field.label) {
            fieldDict[field.name] = field.label;
          }
        });
      }
      Object.values(obj).forEach(findSpecs);
    }
  };

  findSpecs(restoreExpect);
  findSpecs(nodeExpect);

  // Stringify the filter so we can run regex replacements on the variables
  let jsonString = JSON.stringify(node.filter);

  // 2. Replace raw Field IDs with Human-Readable Labels inside the string
  // We do this first so a string like "{{1.fldXYZ}}" becomes "{{1.Person}}"
  for (const [fieldId, label] of Object.entries(fieldDict)) {
    // \b ensures we only match the exact ID, not a partial string
    const fieldRegex = new RegExp(`\\b${fieldId}\\b`, "g");
    jsonString = jsonString.replace(fieldRegex, label);
  }

  // 3. Replace Module IDs with their UI Names (e.g., "{{1." -> "{{[Search Records].")
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
