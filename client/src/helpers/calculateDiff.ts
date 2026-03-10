import _ from "lodash";
import { flattenScenario } from "./flattenScenario";
import { findMatch } from "./findMatch";
import { createIdMap } from "./createIdMap";
import { getDeepDiff } from "./getDeepDiff";
import { enrichFilter } from "./enrichFilter";
import { normalizeConfig } from "./normalizeConfig";
import { SETTING_KEYS } from "../config/SETTING_KEYS";

export interface DiffOptions {
  ignoreScenarioName?: boolean;
  ignoreConnections?: boolean;
  ignoreHooks?: boolean;
  ignoreModuleNames?: boolean;
  showRawMappings?: boolean;
  allConnections?: any[];
  allHooks?: any[];
}

// HELPER: Translates raw integers into human-readable labels ONLY
const injectLiveLabels = (
  differences: any[],
  options: DiffOptions,
  oldNode: any,
  newNode: any,
) => {
  if (!differences) return;

  const getMetaLabel = (node: any, fieldPath: string, rawValue: any) => {
    if (!node || !node.metadata?.restore) return rawValue;
    const key = fieldPath.split(".").pop() || fieldPath;
    const label =
      node.metadata.restore.parameters?.[key]?.label ||
      node.metadata.restore.expect?.[key]?.label;

    // Return JUST the label, no ID
    return label ? label : rawValue;
  };

  const findName = (
    id: any,
    type: "connection" | "hook",
    node: any,
    fieldPath: string,
  ) => {
    const numId = Number(id);
    if (isNaN(numId)) return id;

    // 1. Try to find the exact live name from the API lists
    if (type === "connection" && options.allConnections) {
      const match = options.allConnections.find((c: any) => c.id === numId);
      if (match) return match.name; // Return JUST the name, no ID
    }
    if (type === "hook" && options.allHooks) {
      const match = options.allHooks.find((h: any) => h.id === numId);
      if (match) return match.name; // Return JUST the name, no ID
    }

    // 2. Fallback to Make's internal metadata label
    return getMetaLabel(node, fieldPath, id);
  };

  differences.forEach((diff: any) => {
    const key = diff.field.split(".").pop() || diff.field;

    // Standard external dependencies
    if (key === "__IMTCONN__" || key === "account" || key === "connection") {
      if (diff.oldValue !== undefined)
        diff.oldValue = findName(
          diff.oldValue,
          "connection",
          oldNode,
          diff.field,
        );
      if (diff.newValue !== undefined)
        diff.newValue = findName(
          diff.newValue,
          "connection",
          newNode,
          diff.field,
        );
    }
    if (key === "hook") {
      if (diff.oldValue !== undefined)
        diff.oldValue = findName(diff.oldValue, "hook", oldNode, diff.field);
      if (diff.newValue !== undefined)
        diff.newValue = findName(diff.newValue, "hook", newNode, diff.field);
    }
  });
};

export function compareBlueprints(
  sandboxJson: any,
  prodJson: any,
  options: DiffOptions = {},
) {
  const report = {
    summary: { added: 0, removed: 0, modified: 0 },
    changes: [] as any[],
  };

  const metaChanges: any[] = [];

  if (!options.ignoreScenarioName) {
    if (sandboxJson.name !== prodJson.name) {
      metaChanges.push({
        field: "Scenario Name",
        oldValue: prodJson.name,
        newValue: sandboxJson.name,
      });
    }
  }

  const getSetting = (json: any, key: string) => json.metadata?.scenario?.[key];

  SETTING_KEYS.forEach((key) => {
    const sbVal = getSetting(sandboxJson, key);
    const prodVal = getSetting(prodJson, key);

    if (sbVal !== prodVal) {
      metaChanges.push({
        field: `Settings.${key}`,
        oldValue: prodVal,
        newValue: sbVal,
      });
    }
  });

  if (metaChanges.length > 0) {
    report.changes.push({
      type: "MODIFIED",
      moduleId: "Global",
      moduleName: "Scenario Configuration",
      module: "Settings",
      moduleType: "CONFIG",
      path: "Scenario Settings",
      index: -999,
      changes: metaChanges,
    });
    report.summary.modified++;
  }

  const sandboxNodes = flattenScenario(sandboxJson.flow);
  const prodNodes = flattenScenario(prodJson.flow);
  const sandboxIdMap = createIdMap(sandboxNodes);
  const prodIdMap = createIdMap(prodNodes);

  const matchedProdIds = new Set();

  sandboxNodes.forEach((sbNode) => {
    const prodMatch = findMatch(sbNode, prodNodes, matchedProdIds);

    if (!prodMatch) {
      // --- ADDED MODULE ---
      const sbConfig = normalizeConfig(sbNode, sandboxIdMap, options);
      const allNewFields = getDeepDiff({}, sbConfig);

      injectLiveLabels(allNewFields, options, null, sbNode);

      const filterChange =
        sbNode.filter || sbNode.isFallback
          ? {
              type: "ADDED",
              newValue: enrichFilter(sbNode, sandboxIdMap, options),
              isFallback: sbNode.isFallback,
            }
          : null;

      report.changes.push({
        type: "ADDED",
        moduleId: sbNode.id,
        moduleName: sbNode.metadataName,
        module: sbNode.uiName,
        moduleType: sbNode.module,
        path: sbNode.path,
        index: sbNode.index,
        incomingFrom: sbNode.incomingFrom,
        details: "This module is new in the Sandbox.",
        changes: allNewFields,
        filterChange: filterChange,
        isDisabled: sbNode.isDisabled,
      });
      report.summary.added++;
    } else {
      // --- MODIFIED MODULE ---
      matchedProdIds.add(prodMatch.uniqueKey);

      const sbConfig = normalizeConfig(sbNode, sandboxIdMap, options);
      const prodConfig = normalizeConfig(prodMatch, prodIdMap, options);

      const differences = getDeepDiff(prodConfig, sbConfig);

      injectLiveLabels(differences, options, prodMatch, sbNode);

      let filterChange = null;

      if (
        !_.isEqual(prodMatch.filter, sbNode.filter) ||
        prodMatch.isFallback !== sbNode.isFallback
      ) {
        filterChange = {
          type: "MODIFIED",
          oldValue: enrichFilter(prodMatch, prodIdMap, options),
          newValue: enrichFilter(sbNode, sandboxIdMap, options),
          isFallback: sbNode.isFallback,
          wasFallback: prodMatch.isFallback,
        };
      }

      if (!options.ignoreModuleNames) {
        if (sbNode.uiName !== prodMatch.uiName) {
          differences.unshift({
            field: "Module Name",
            oldValue: prodMatch.uiName,
            newValue: sbNode.uiName,
          });
        }
      }

      if (differences.length > 0 || filterChange) {
        report.changes.push({
          type: "MODIFIED",
          moduleId: sbNode.id,
          moduleName: sbNode.metadataName,
          module: sbNode.uiName,
          moduleType: sbNode.module,
          path: sbNode.path,
          index: sbNode.index,
          incomingFrom: sbNode.incomingFrom,
          changes: differences,
          filterChange: filterChange,
          isDisabled: sbNode.isDisabled,
        });
        report.summary.modified++;
      }
    }
  });

  // --- REMOVED MODULES ---
  prodNodes.forEach((pNode) => {
    if (!matchedProdIds.has(pNode.uniqueKey)) {
      report.changes.push({
        type: "REMOVED",
        moduleId: pNode.id,
        moduleName: pNode.metadataName,
        module: pNode.uiName,
        moduleType: pNode.module,
        path: pNode.path,
        index: pNode.index,
        incomingFrom: pNode.incomingFrom,
        details: "This module exists in Production but was removed in Sandbox.",
        isDisabled: pNode.isDisabled,
      });
      report.summary.removed++;
    }
  });

  return report;
}
