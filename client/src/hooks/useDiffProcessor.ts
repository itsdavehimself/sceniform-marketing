import { useMemo } from "react";
import { compareBlueprints } from "../calculateDiff";
import { getBrokenRefs } from "../helpers/getBrokenRefs";

interface DiffProcessorProps {
  prodJson: string;
  sandboxJson: string;
  isReverse: boolean;
  ignoreScenarioName: boolean;
  ignoreConnections: boolean;
  ignoreModuleNames: boolean;
  showRawMappings: boolean;
}

export const useDiffProcessor = ({
  prodJson,
  sandboxJson,
  isReverse,
  ignoreScenarioName,
  ignoreConnections,
  ignoreModuleNames,
  showRawMappings,
}: DiffProcessorProps) => {
  // 1. Calculate the core diff report
  const diffReport = useMemo(() => {
    if (!prodJson || !sandboxJson) return null;
    try {
      const prod = JSON.parse(prodJson);
      const sandbox = JSON.parse(sandboxJson);
      const options = {
        ignoreScenarioName,
        ignoreConnections,
        ignoreModuleNames,
        showRawMappings,
      };
      return isReverse
        ? compareBlueprints(prod, sandbox, options)
        : compareBlueprints(sandbox, prod, options);
    } catch (e) {
      console.error("Parse Error", e);
      return null;
    }
  }, [
    prodJson,
    sandboxJson,
    isReverse,
    ignoreScenarioName,
    ignoreConnections,
    ignoreModuleNames,
    showRawMappings,
  ]);

  // 2. Tally up the error statistics
  const errorStats = useMemo(() => {
    if (!diffReport)
      return { moduleCount: 0, refCount: 0, errorModuleIds: new Set() };

    let refCount = 0;
    const errorModuleIds = new Set<string | number>();

    diffReport.changes.forEach((change: any) => {
      let localErrors = 0;
      if (change.changes) {
        change.changes.forEach(
          (diff: any) => (localErrors += getBrokenRefs(diff.newValue).length),
        );
      }
      if (change.filterChange && change.filterChange.newValue) {
        localErrors += getBrokenRefs(change.filterChange.newValue).length;
      }
      if (localErrors > 0) {
        refCount += localErrors;
        errorModuleIds.add(change.moduleId);
      }
    });
    return { moduleCount: errorModuleIds.size, refCount, errorModuleIds };
  }, [diffReport]);

  // 3. Group the changes by their route paths
  const processedGroups = useMemo(() => {
    if (!diffReport) return {};
    const byPath = diffReport.changes.reduce((acc: any, change: any) => {
      const key = change.path || "Main Flow";
      if (!acc[key]) acc[key] = [];
      acc[key].push(change);
      return acc;
    }, {});

    Object.keys(byPath).forEach((path) => {
      const changes = byPath[path];
      const replacements: any[] = [];
      const processedAddedIds = new Set();
      const processedRemovedIds = new Set();
      const removedByIndex = new Map();

      changes
        .filter((c: any) => c.type === "REMOVED")
        .forEach((c: any) => removedByIndex.set(c.index, c));

      changes.forEach((c: any) => {
        if (c.type === "ADDED") {
          const removedMatch = removedByIndex.get(c.index);
          if (removedMatch) {
            replacements.push({
              type: "REPLACEMENT",
              moduleId: c.moduleId,
              newChange: c,
              oldChange: removedMatch,
              index: c.index,
            });
            processedAddedIds.add(c.moduleId);
            processedRemovedIds.add(removedMatch.moduleId);
          }
        }
      });

      changes.forEach((c: any) => {
        if (c.type === "MODIFIED") replacements.push(c);
        else if (c.type === "ADDED" && !processedAddedIds.has(c.moduleId))
          replacements.push(c);
        else if (c.type === "REMOVED" && !processedRemovedIds.has(c.moduleId))
          replacements.push(c);
      });

      replacements.sort((a, b) => (a.index || 0) - (b.index || 0));
      byPath[path] = replacements;
    });
    return byPath;
  }, [diffReport]);

  // 4. Sort the group keys logically
  const sortedGroupKeys = useMemo(() => {
    return Object.keys(processedGroups).sort((a, b) => {
      if (a === "Scenario Settings") return -1;
      if (b === "Scenario Settings") return 1;
      if (a === "Main Flow") return -1;
      if (b === "Main Flow") return 1;
      return a.localeCompare(b);
    });
  }, [processedGroups]);

  return { diffReport, errorStats, processedGroups, sortedGroupKeys };
};
