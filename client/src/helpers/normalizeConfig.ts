import type { DiffOptions } from "../calculateDiff";
import _ from "lodash";

function normalizeConfig(node: any, idMap: any, options: DiffOptions) {
  const parameters = _.cloneDeep(node.parameters || {});

  // HELPER: Look up the real connection name
  const getConnectionName = (id: string | number) => {
    if (!options.connections) return null;
    const match = options.connections.find((c: any) => c.id === Number(id));
    return match ? match.name : null;
  };

  // 1. Handle standard Make Connection ID (__IMTCONN__)
  if (parameters.__IMTCONN__) {
    if (!options.ignoreConnections) {
      const connId = parameters.__IMTCONN__;
      const realName = getConnectionName(connId);

      // Fallback to the JSON label if the connection was deleted from Make's DB
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
    mapper: node.mapper,
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
