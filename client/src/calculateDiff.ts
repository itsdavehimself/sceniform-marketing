import _ from "lodash";

export interface DiffOptions {
  ignoreScenarioName?: boolean;
  ignoreConnections?: boolean;
  ignoreModuleNames?: boolean;
  showRawMappings?: boolean;
}

/**
 * MAIN FUNCTION
 */
export function compareBlueprints(
  sandboxJson: any,
  prodJson: any,
  options: DiffOptions = {},
) {
  const report = {
    summary: { added: 0, removed: 0, modified: 0 },
    changes: [] as any[],
  };

  // ==========================================
  // 1. SCENARIO SETTINGS & METADATA
  // ==========================================
  const metaChanges: any[] = [];

  // A. Compare Name
  if (!options.ignoreScenarioName) {
    if (sandboxJson.name !== prodJson.name) {
      metaChanges.push({
        field: "Scenario Name",
        oldValue: prodJson.name,
        newValue: sandboxJson.name,
      });
    }
  }

  // B. Compare Scenario Settings
  const settingKeys = [
    "roundtrips",
    "maxErrors",
    "autoCommit",
    "autoCommitTriggerLast",
    "sequential",
    "confidential",
    "dataloss",
    "dlq",
    "freshVariables",
  ];

  const getSetting = (json: any, key: string) => json.metadata?.scenario?.[key];

  settingKeys.forEach((key) => {
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

  // ==========================================
  // 2. FLOW & NODE COMPARISON
  // ==========================================
  const sandboxNodes = flattenScenario(sandboxJson.flow);
  const prodNodes = flattenScenario(prodJson.flow);
  const sandboxIdMap = createIdMap(sandboxNodes);
  const prodIdMap = createIdMap(prodNodes);

  const matchedProdIds = new Set();

  sandboxNodes.forEach((sbNode) => {
    let prodMatch = findMatch(sbNode, prodNodes, matchedProdIds);

    if (!prodMatch) {
      // --- ADDED MODULE ---
      const sbConfig = normalizeConfig(sbNode, sandboxIdMap, options);
      const allNewFields = getDeepDiff({}, sbConfig);

      // Check if this new module has a filter OR is a fallback route
      const filterChange =
        sbNode.filter || sbNode.isFallback
          ? {
              type: "ADDED",
              newValue: enrichFilter(sbNode.filter, sandboxIdMap, options),
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
      });
      report.summary.added++;
    } else {
      // --- MODIFIED MODULE ---
      matchedProdIds.add(prodMatch.uniqueKey);

      const sbConfig = normalizeConfig(sbNode, sandboxIdMap, options);
      const prodConfig = normalizeConfig(prodMatch, prodIdMap, options);

      const differences = getDeepDiff(prodConfig, sbConfig);

      let filterChange = null;

      if (
        !_.isEqual(prodMatch.filter, sbNode.filter) ||
        prodMatch.isFallback !== sbNode.isFallback
      ) {
        filterChange = {
          type: "MODIFIED",
          oldValue: enrichFilter(prodMatch.filter, prodIdMap, options),
          newValue: enrichFilter(sbNode.filter, sandboxIdMap, options),
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
      });
      report.summary.removed++;
    }
  });

  return report;
}

// ==========================================
// HELPERS
// ==========================================

function flattenScenario(
  flow: any[],
  path = "Main Flow",
  parentName: string | null = null,
  indexOffset = 0,
) {
  let nodes: any[] = [];

  if (!flow || !Array.isArray(flow)) return nodes;

  let previousNodeName = parentName || "Trigger/Webhook";

  flow.forEach((mod, index) => {
    const rawName =
      mod.metadata?.designer?.name ||
      mod.metadata?.name ||
      mod.metadata?.designer?.label ||
      "";

    let uiName = rawName;
    if (!uiName) {
      if (
        mod.module === "util:SetVariable2" ||
        mod.module === "util:GetVariable2"
      ) {
        uiName = mod.mapper?.name
          ? `Variable: ${mod.mapper.name}`
          : `${mod.module.split(":")[1]}`;
      } else {
        uiName = `${mod.module.split(":")[1] || mod.module}`;
      }
    }

    const uniqueKey = `${mod.id}-${path}`;

    const connectionLabel =
      mod.metadata?.restore?.parameters?.__IMTCONN__?.label ||
      mod.metadata?.restore?.expect?.__IMTCONN__?.label ||
      null;

    const node = {
      id: mod.id,
      metadataName: rawName,
      module: mod.module,
      uiName: uiName,
      uniqueKey: uniqueKey,
      path: path,
      index: index + indexOffset,
      incomingFrom: previousNodeName,
      mapper: mod.mapper || {},
      parameters: mod.parameters || {},
      // NEW: Pass the raw routes array so we can check 'disabled' status later
      routes: mod.routes || [],
      filter: mod.filter || null,
      connectionLabel: connectionLabel,
      isFallback: false,
    };

    nodes.push(node);

    previousNodeName = uiName;

    if (mod.routes && Array.isArray(mod.routes)) {
      const fallbackIndex = mod.parameters?.else;

      mod.routes.forEach((route: any, rIndex: number) => {
        const segment = `${uiName} (Route ${rIndex + 1})`;
        const routePath =
          path === "Main Flow" ? segment : `${path} ➞ ${segment}`;

        const routeNodes = flattenScenario(route.flow, routePath, uiName);

        if (
          typeof fallbackIndex !== "undefined" &&
          Number(fallbackIndex) === rIndex
        ) {
          if (routeNodes.length > 0) {
            routeNodes[0].isFallback = true;
          }
        }

        nodes = nodes.concat(routeNodes);
      });
    }
  });

  return nodes;
}

function findMatch(
  targetNode: any,
  searchList: any[],
  alreadyMatchedIds: Set<any>,
) {
  let match = searchList.find(
    (n) =>
      !alreadyMatchedIds.has(n.uniqueKey) &&
      n.id === targetNode.id &&
      n.module === targetNode.module,
  );
  if (match) return match;

  match = searchList.find(
    (n) =>
      !alreadyMatchedIds.has(n.uniqueKey) &&
      n.module === targetNode.module &&
      n.path === targetNode.path &&
      n.index === targetNode.index,
  );

  return match;
}

function createIdMap(nodes: any[]) {
  const map: any = {};
  nodes.forEach((n) => {
    const displayName = n.uiName || n.module.split(":")[1] || n.module;
    map[n.id] = `[${displayName} ID:${n.id}]`;
  });
  return map;
}

function enrichFilter(filter: any, idMap: any, options: DiffOptions) {
  if (!filter) return null;
  let jsonString = JSON.stringify(filter);

  if (!options.showRawMappings) {
    jsonString = jsonString.replace(/\{\{(\d+)\./g, (match, id) => {
      const name = idMap[id] || `[Broken Reference-${id}]`;
      return `{{${name}.`;
    });
  }

  return JSON.parse(jsonString);
}

function normalizeConfig(node: any, idMap: any, options: DiffOptions) {
  const parameters = _.cloneDeep(node.parameters || {});

  if (parameters.__IMTCONN__) {
    if (!options.ignoreConnections) {
      const connectionValue = node.connectionLabel || parameters.__IMTCONN__;
      parameters["Connection"] = connectionValue;
    }
    delete parameters.__IMTCONN__;
  }

  // NEW: Normalize Route Statuses (Enabled/Disabled) into a comparable object
  const routeStates: Record<string, string> = {};
  if (node.routes && Array.isArray(node.routes) && node.routes.length > 0) {
    node.routes.forEach((route: any, index: number) => {
      // In Make.com JSON, if 'disabled' key is missing, it is Enabled.
      // If 'disabled' is true, it is Disabled.
      routeStates[`Route ${index + 1}`] = route.disabled
        ? "Disabled"
        : "Enabled";
    });
  }

  const configObject: any = {
    mapper: node.mapper,
    parameters: parameters,
  };

  // Only add routes if we found some
  if (Object.keys(routeStates).length > 0) {
    configObject["routes"] = routeStates;
  }

  let configString = JSON.stringify(configObject);

  if (!options.showRawMappings) {
    configString = configString.replace(/\{\{(\d+)\./g, (match, id) => {
      const name = idMap[id] || `[Unknown-${id}]`;
      return `{{${name}.`;
    });
  }

  return JSON.parse(configString);
}

function getDeepDiff(obj1: any, obj2: any) {
  const diffs: any[] = [];
  const allKeys = _.union(_.keys(obj1), _.keys(obj2));

  function check(key: string, val1: any, val2: any, parentKey = "") {
    const fullKey = parentKey ? `${parentKey}.${key}` : key;
    if (_.isEqual(val1, val2)) return;
    if (_.isObject(val1) && _.isObject(val2) && !_.isArray(val1)) {
      const keys = _.union(_.keys(val1), _.keys(val2));
      keys.forEach((k) => check(k, val1[k], val2[k], fullKey));
    } else {
      diffs.push({
        field: fullKey,
        oldValue: val1,
        newValue: val2,
      });
    }
  }

  allKeys.forEach((k) => check(k, obj1[k], obj2[k]));
  return diffs;
}
