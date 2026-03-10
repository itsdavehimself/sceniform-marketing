import type { DiffOptions } from "./calculateDiff";
import _ from "lodash";

function normalizeConfig(node: any, idMap: any, options: DiffOptions) {
  const parameters = _.cloneDeep(node.parameters || {});
  let mapper = _.cloneDeep(node.mapper || {});

  // HELPER: Look up the real connection name
  const getConnectionName = (id: string | number) => {
    if (!options.allConnections) return null;
    const list = options.allConnections;
    const match = list.find((c: any) => c.id === Number(id));
    return match ? match.name : null;
  };

  const restoreExpect = node.metadata?.restore?.expect || {};
  const nodeExpect = node.metadata?.expect || [];

  const fieldDict: Record<string, string> = {};

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

  const translate = (obj: any, isRoot = false): any => {
    if (!obj || typeof obj !== "object") return obj;
    if (Array.isArray(obj)) return obj.map((item) => translate(item, false));

    const translatedObj: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const newKey = fieldDict[key] || key;
      let newValue = value;

      if (isRoot && typeof value === "string") {
        if (restoreExpect[key]?.label) {
          newValue = restoreExpect[key].label;
        } else if (
          restoreExpect[key]?.path &&
          Array.isArray(restoreExpect[key].path)
        ) {
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

  mapper = translate(mapper, true);

  // --- CONNECTION HANDLING ---

  // 1. Standard Make Connection ID
  if (parameters.__IMTCONN__) {
    if (!options.ignoreConnections) {
      const connId = parameters.__IMTCONN__;
      const realName = getConnectionName(connId);

      const displayName =
        realName || node.connectionLabel || "Unknown Connection";

      parameters["Connection"] = `${displayName} (ID: ${connId})`;
    }
    // Always delete the raw ID so it isn't diffed
    delete parameters.__IMTCONN__;
  }

  // 2. Legacy 'account' parameter (like in the Email module)
  if (parameters.account !== undefined) {
    if (!options.ignoreConnections) {
      const connId = parameters.account;
      const realName = getConnectionName(connId);
      parameters["Account"] = realName
        ? `${realName} (ID: ${connId})`
        : `ID: ${connId}`;
    }
    // Always delete the raw ID so it isn't diffed
    delete parameters.account;
  }

  // 3. Legacy 'connection' parameter
  if (parameters.connection !== undefined) {
    if (!options.ignoreConnections) {
      const connId = parameters.connection;
      const realName = getConnectionName(connId);
      parameters["Connection"] = realName
        ? `${realName} (ID: ${connId})`
        : `ID: ${connId}`;
    }
    // Always delete the raw ID so it isn't diffed
    delete parameters.connection;
  }

  // --- HOOK HANDLING ---
  if (options.ignoreHooks) {
    delete parameters.hook;
    delete parameters.webhook;
    delete parameters.webHook;
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

  // Catch any straggler accounts/connections placed at the root of the node
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

  if (!options.ignoreHooks && node.hook) {
    configObject["hook"] = node.hook;
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
