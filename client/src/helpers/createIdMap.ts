function createIdMap(nodes: any[]) {
  const map: any = {};
  nodes.forEach((n) => {
    const displayName = n.uiName || n.module.split(":")[1] || n.module;
    map[n.id] = `[${displayName} ID:${n.id}]`;
  });
  return map;
}

export { createIdMap };
