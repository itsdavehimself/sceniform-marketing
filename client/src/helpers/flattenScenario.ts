function flattenScenario(
  flow: any[],
  path = "Main Flow",
  parentName: string | null = null,
  indexOffset = 0,
  ancestorDisabled = false,
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

      // ADD THESE TWO LINES
      account: mod.account,
      connection: mod.connection,

      routes: mod.routes || [],
      hasErrorHandler: !!(mod.onerror && mod.onerror.length > 0),
      filter: mod.filter || null,
      connectionLabel: connectionLabel,
      isFallback: false,
      isDisabled: ancestorDisabled,
    };

    nodes.push(node);

    previousNodeName = uiName;

    // 1. RECURSE INTO ROUTER ROUTES
    if (mod.routes && Array.isArray(mod.routes)) {
      const fallbackIndex = mod.parameters?.else;

      mod.routes.forEach((route: any, rIndex: number) => {
        const segment = `${uiName} (Route ${rIndex + 1})`;
        const routePath =
          path === "Main Flow" ? segment : `${path} ➞ ${segment}`;

        const isRouteDisabled = route.disabled === true;
        const effectivelyDisabled = ancestorDisabled || isRouteDisabled;

        const routeNodes = flattenScenario(
          route.flow,
          routePath,
          uiName,
          0,
          effectivelyDisabled,
        );

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

    // 2. RECURSE INTO ERROR HANDLERS (New Logic)
    if (mod.onerror && Array.isArray(mod.onerror) && mod.onerror.length > 0) {
      // Create a specific label for error flows
      const segment = `${uiName} ⚠️ Error Handler`;
      const errorPath = path === "Main Flow" ? segment : `${path} ➞ ${segment}`;

      // Error handlers inherit the disabled status of their parent
      const errorNodes = flattenScenario(
        mod.onerror,
        errorPath,
        uiName, // Incoming from the module that failed
        0,
        ancestorDisabled,
      );

      nodes = nodes.concat(errorNodes);
    }
  });

  return nodes;
}

export { flattenScenario };
