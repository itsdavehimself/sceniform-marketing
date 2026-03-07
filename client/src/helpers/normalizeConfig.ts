import type { DiffOptions } from "../calculateDiff";
import _ from "lodash";

function normalizeConfig(node: any, idMap: any, options: DiffOptions) {
  const parameters = _.cloneDeep(node.parameters || {});
  let mapper = _.cloneDeep(node.mapper || {});

  // HELPER: Look up the real connection name
  const getConnectionName = (id: string | number) => {
    if (!options.connections) return null;
    const match = options.connections.find((c: any) => c.id === Number(id));
    return match ? match.name : null;
  };

  // --- NEW: Translate raw IDs to Human-Readable Labels ---
  const restoreExpect = node.metadata?.restore?.expect || {};
  const nodeExpect = node.metadata?.expect || [];

  // 1. Build a dictionary of Field IDs (fldXYZ) to Labels (Notes, Person, etc.)
  const fieldDict: Record<string, string> = {};

  const findSpecs = (obj: any) => {
    if (!obj || typeof obj !== "object") return;
    if (Array.isArray(obj)) {
      obj.forEach(findSpecs);
    } else {
      // If we find a "spec" array (like Airtable fields), map the name to the label
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

  // Traverse both metadata trees to find all field definitions
  findSpecs(restoreExpect);
  findSpecs(nodeExpect);

  // 2. Recursive function to replace keys and values in the mapper
  const translate = (obj: any, isRoot = false): any => {
    if (!obj || typeof obj !== "object") return obj;
    if (Array.isArray(obj)) return obj.map((item) => translate(item, false));

    const translatedObj: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Translate keys (e.g., fld0H5lNM34ni5qPS -> Person)
      const newKey = fieldDict[key] || key;
      let newValue = value;

      // Translate top-level values (e.g., appLjIhgKjM9u4v2O -> Greg)
      if (isRoot && typeof value === "string") {
        if (restoreExpect[key]?.label) {
          newValue = restoreExpect[key].label;
        } else if (
          restoreExpect[key]?.path &&
          Array.isArray(restoreExpect[key].path)
        ) {
          // Translate Google Drive/Sheets folder paths
          newValue = restoreExpect[key].path.join(" / ");
        }
      }

      if (typeof newValue === "object" && newValue !== null) {
        newValue = translate(newValue, false);
      }

      translatedObj[newKey] = newValue;
    }
    return translatedObj;
  };

  // Apply the translation to the mapper before stringifying
  mapper = translate(mapper, true);

  // 1. Handle standard Make Connection ID (__IMTCONN__)
  if (parameters.__IMTCONN__) {
    if (!options.ignoreConnections) {
      const connId = parameters.__IMTCONN__;
      const realName = getConnectionName(connId);

      const displayName =
        realName || node.connectionLabel || "Unknown Connection";

      parameters["Connection"] = `${displayName} (ID: ${connId})`;
    }
    delete parameters.__IMTCONN__;
  }

  const routeStates: Record<string, string> = {};
  if (node.routes && Array.isArray(node.routes) && node.routes.length > 0) {
    node.routes.forEach((route: any, index: number) => {
      routeStates[`Route ${index + 1}`] = route.disabled
        ? "Disabled"
        : "Enabled";
    });
  }

  const configObject: any = {
    mapper: mapper,
    parameters: parameters,
  };

  // 2. Handle generic Account / Connection IDs
  if (!options.ignoreConnections) {
    if (node.account) {
      const realName = getConnectionName(node.account);
      configObject["Account"] = realName
        ? `${realName} (ID: ${node.account})`
        : `ID: ${node.account}`;
    }
    if (node.connection) {
      const realName = getConnectionName(node.connection);
      configObject["Connection"] = realName
        ? `${realName} (ID: ${node.connection})`
        : `ID: ${node.connection}`;
    }
  }

  if (Object.keys(routeStates).length > 0) {
    configObject["routes"] = routeStates;
  }

  if (node.hasErrorHandler) {
    configObject["errorHandler"] = "Active";
  }

  let configString = JSON.stringify(configObject);

  configString = configString.replace(/\{\{(\d+)\./g, (match, id) => {
    if (!idMap[id]) return `{{[Unknown-${id}].`;
    return options.showRawMappings ? match : `{{${idMap[id]}.`;
  });

  return JSON.parse(configString);
}

export { normalizeConfig };
