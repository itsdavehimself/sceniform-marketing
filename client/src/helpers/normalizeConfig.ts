import type { DiffOptions } from "../calculateDiff";
import _ from "lodash";

function normalizeConfig(node: any, idMap: any, options: DiffOptions) {
  const parameters = _.cloneDeep(node.parameters || {});

  if (parameters.__IMTCONN__) {
    if (!options.ignoreConnections) {
      const connectionValue = node.connectionLabel || parameters.__IMTCONN__;
      parameters["Connection"] = connectionValue;
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

  if (Object.keys(routeStates).length > 0) {
    configObject["routes"] = routeStates;
  }

  // Detect presence of Error Handler as a config property of the parent
  if (node.hasErrorHandler) {
    configObject["errorHandler"] = "Active";
  }

  let configString = JSON.stringify(configObject);

  configString = configString.replace(/\{\{(\d+)\./g, (match, id) => {
    if (!idMap[id]) {
      // It's broken: always show the error tag
      return `{{[Unknown-${id}].`;
    }
    // It's valid: respect the raw mappings toggle
    return options.showRawMappings ? match : `{{${idMap[id]}.`;
  });

  return JSON.parse(configString);
}

export { normalizeConfig };
