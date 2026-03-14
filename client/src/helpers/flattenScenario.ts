// flattenScenario.ts

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
  let currentPath = path; // NEW: Track path dynamically within the same flow array

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

    // --- NEW: DAG CONVERGENCE DETECTION ---
    // If we hit a Merge module, redirect it and all subsequent modules into a "Merged" path group
    if (mod.module === "builtin:BasicMerge") {
      // Use a space instead of ➞ so it doesn't increase indent depth,
      // but it still sorts alphabetically AFTER the branch's "➞" arrow!
      currentPath = `${path} 🔀 Merged`;
    }

    const uniqueKey = `${mod.id}-${currentPath}`;

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
      path: currentPath, // Assign to currentPath
      index: index + indexOffset,
      incomingFrom: previousNodeName,
      mapper: mod.mapper || {},
      parameters: mod.parameters || {},
      account: mod.account,
      connection: mod.connection,
      routes: mod.routes || [],
      branches: mod.branches || [],
      outputs: mod.outputs || [],
      hasErrorHandler: !!(mod.onerror && mod.onerror.length > 0),
      filter: mod.filter || null,
      connectionLabel: connectionLabel,
      isFallback: false,
      isDisabled: ancestorDisabled,
      metadata: mod.metadata || {},
    };

    nodes.push(node);
    previousNodeName = uiName;

    // 1. RECURSE INTO ROUTER ROUTES
    if (mod.routes && Array.isArray(mod.routes)) {
      const fallbackIndex = mod.parameters?.else;
      mod.routes.forEach((route: any, rIndex: number) => {
        const segment = `${uiName} (Route ${rIndex + 1})`;
        const routePath =
          currentPath === "Main Flow" ? segment : `${currentPath} ➞ ${segment}`;
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
          if (routeNodes.length > 0) routeNodes[0].isFallback = true;
        }
        nodes = nodes.concat(routeNodes);
      });
    }

    // 2. RECURSE INTO ERROR HANDLERS
    if (mod.onerror && Array.isArray(mod.onerror) && mod.onerror.length > 0) {
      const segment = `${uiName} ⚠️ Error Handler`;
      const errorPath =
        currentPath === "Main Flow" ? segment : `${currentPath} ➞ ${segment}`;
      const errorNodes = flattenScenario(
        mod.onerror,
        errorPath,
        uiName,
        0,
        ancestorDisabled,
      );
      nodes = nodes.concat(errorNodes);
    }

    // 3. RECURSE INTO IF-ELSE BRANCHES
    if (mod.branches && Array.isArray(mod.branches)) {
      mod.branches.forEach((branch: any, bIndex: number) => {
        // NEW: Prepend the branch index so Branch 1 ALWAYS sorts before Branch 2 (Else)
        const branchLabel = branch.label
          ? branch.label
          : branch.type === "else"
            ? "Else"
            : "Unnamed";
        const segment = `${uiName} (Branch ${bIndex + 1}: ${branchLabel})`;

        const branchPath =
          currentPath === "Main Flow" ? segment : `${currentPath} ➞ ${segment}`;

        const branchNodes = flattenScenario(
          branch.flow,
          branchPath,
          uiName,
          0,
          ancestorDisabled,
        );
        nodes = nodes.concat(branchNodes);
      });
    }
  });

  return nodes;
}
export { flattenScenario };
