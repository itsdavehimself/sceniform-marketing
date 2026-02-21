function findMatch(
  targetNode: any,
  searchList: any[],
  alreadyMatchedIds: Set<any>,
) {
  // PASS 1: Strict ID & Module Type Match (High Confidence)
  // If the Make.com ID hasn't changed, this is our guaranteed match.
  const match = searchList.find(
    (n) =>
      !alreadyMatchedIds.has(n.uniqueKey) &&
      n.id === targetNode.id &&
      n.module === targetNode.module,
  );
  if (match) return match;

  // PASS 2: Topological & Contextual Heuristic
  // Filter available candidates to the same module type and same path
  const candidates = searchList.filter(
    (n) =>
      !alreadyMatchedIds.has(n.uniqueKey) &&
      n.module === targetNode.module &&
      n.path === targetNode.path,
  );

  if (candidates.length === 0) return undefined;

  let bestMatch: any = null;
  let highestScore = -1;

  candidates.forEach((candidate) => {
    let score = 0;

    // A. Topological Anchor (Most Important)
    // If it comes from the same parent, it's highly likely the same logical step
    if (candidate.incomingFrom === targetNode.incomingFrom) {
      score += 4;
    }

    // B. Semantic Anchors
    // Did the user name it the same thing?
    if (
      candidate.metadataName &&
      candidate.metadataName === targetNode.metadataName
    ) {
      score += 3;
    }
    if (candidate.uiName === targetNode.uiName) {
      score += 1;
    }

    // C. Positional Anchors (Index Shifting)
    // If someone inserted 1 module, the index shifted by 1.
    const indexDiff = Math.abs(candidate.index - targetNode.index);
    if (indexDiff === 0) {
      score += 2; // Exact index
    } else if (indexDiff <= 3) {
      score += 1; // Minor shift (node inserted or removed nearby)
    }

    // D. Configuration Similarity (Optional Tie-Breaker)
    // If it's the exact same module type, checking if they have identical mappers helps
    // disambiguate blocks of identical modules (like 5 "Set Variable" modules in a row)
    const targetMapperLength = JSON.stringify(targetNode.mapper || {}).length;
    const candidateMapperLength = JSON.stringify(candidate.mapper || {}).length;
    if (Math.abs(targetMapperLength - candidateMapperLength) < 10) {
      score += 1;
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = candidate;
    }
  });

  // We require a minimum confidence score to avoid mapping a completely unrelated
  // module just because it shares the same type.
  const MINIMUM_CONFIDENCE_SCORE = 3;

  if (highestScore >= MINIMUM_CONFIDENCE_SCORE) {
    return bestMatch;
  }

  return undefined;
}

export { findMatch };
