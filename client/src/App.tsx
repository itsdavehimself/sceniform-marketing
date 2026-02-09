// App.tsx
import React, { useState, useMemo, useEffect } from "react";
import { compareBlueprints } from "./calculateDiff";

// --- PARSING REGEX ---
const SMART_MATCH_REGEX =
  /\[(.*?) ID:(\d+)\]|(\{\{(\d+)\.[^}]*\}\})|(\{\{\[(?:Unknown|Missing Reference|Broken Reference)-(\d+)\].*?\}\})/g;

const BROKEN_REF_REGEX =
  /\[(?:Unknown|Missing Reference|Broken Reference)-(\d+)\]/g;

function App() {
  const [prodJson, setProdJson] = useState<string>("");
  const [sandboxJson, setSandboxJson] = useState<string>("");
  const [isReverse, setIsReverse] = useState<boolean>(false);

  // Settings
  const [ignoreScenarioName, setIgnoreScenarioName] = useState<boolean>(true);
  const [ignoreConnections, setIgnoreConnections] = useState<boolean>(false);
  const [ignoreModuleNames, setIgnoreModuleNames] = useState<boolean>(false);
  const [showRawMappings, setShowRawMappings] = useState<boolean>(false);

  // Module Collapse State
  const [collapsedIds, setCollapsedIds] = useState<Set<string | number>>(
    new Set(),
  );

  // Path/Route Collapse State
  const [collapsedPaths, setCollapsedPaths] = useState<Set<string>>(new Set());

  // --- ERROR FILTER STATE ---
  const [showErrorsOnly, setShowErrorsOnly] = useState<boolean>(false);

  // --- HIGHLIGHTING STATE ---
  const [highlightedModuleId, setHighlightedModuleId] = useState<
    string | number | null
  >(null);

  const toggleCollapse = (id: string | number) => {
    const newSet = new Set(collapsedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setCollapsedIds(newSet);
  };

  const togglePathCollapse = (path: string) => {
    const newSet = new Set(collapsedPaths);
    if (newSet.has(path)) {
      newSet.delete(path);
    } else {
      newSet.add(path);
    }
    setCollapsedPaths(newSet);
  };

  const handleToggleAll = () => {
    // Expand/Collapse modules
    if (collapsedIds.size > 0) {
      setCollapsedIds(new Set());
    } else {
      if (!diffReport) return;
      const allIds = new Set<string | number>();
      diffReport.changes.forEach((c: any) => {
        allIds.add(c.moduleId);
      });
      setCollapsedIds(allIds);
    }
    // Also reset paths on "Expand All"
    if (collapsedPaths.size > 0) {
      setCollapsedPaths(new Set());
    }
  };

  const isAllExpanded = collapsedIds.size === 0 && collapsedPaths.size === 0;

  // --- HELPERS: BROKEN REFS ---
  const getBrokenRefs = (value: any): string[] => {
    if (!value) return [];
    const str =
      typeof value === "object" ? JSON.stringify(value) : String(value);
    const matches = [...str.matchAll(BROKEN_REF_REGEX)];
    return Array.from(new Set(matches.map((m) => m[1])));
  };

  const fetchBlueprint = async (env: "prod" | "sandbox") => {
    setShowErrorsOnly(false);
    try {
      const res = await fetch(
        `http://localhost:1337/api/scenarios/mock/${env}`,
      );
      const data = await res.json();
      const parsed =
        typeof data.blueprint === "string"
          ? JSON.parse(data.blueprint)
          : data.blueprint;
      const formatted = JSON.stringify(parsed, null, 2);
      if (env === "prod") setProdJson(formatted);
      else setSandboxJson(formatted);
    } catch (err) {
      console.error("Error fetching mock:", err);
      alert(
        "Could not fetch. Ensure server is running or paste JSON manually.",
      );
    }
  };

  const diffReport = useMemo(() => {
    if (!prodJson || !sandboxJson) return null;
    try {
      const prod = JSON.parse(prodJson);
      const sandbox = JSON.parse(sandboxJson);
      const options = {
        ignoreScenarioName,
        ignoreConnections,
        ignoreModuleNames,
        showRawMappings,
      };
      return isReverse
        ? compareBlueprints(prod, sandbox, options)
        : compareBlueprints(sandbox, prod, options);
    } catch (e) {
      console.error("Parse Error", e);
      return null;
    }
  }, [
    prodJson,
    sandboxJson,
    isReverse,
    ignoreScenarioName,
    ignoreConnections,
    ignoreModuleNames,
    showRawMappings,
  ]);

  const errorStats = useMemo(() => {
    if (!diffReport)
      return { moduleCount: 0, refCount: 0, errorModuleIds: new Set() };

    let refCount = 0;
    const errorModuleIds = new Set<string | number>();

    diffReport.changes.forEach((change: any) => {
      let localErrors = 0;
      if (change.changes) {
        change.changes.forEach((diff: any) => {
          const refs = getBrokenRefs(diff.newValue);
          localErrors += refs.length;
        });
      }
      if (change.filterChange && change.filterChange.newValue) {
        const refs = getBrokenRefs(change.filterChange.newValue);
        localErrors += refs.length;
      }
      if (localErrors > 0) {
        refCount += localErrors;
        errorModuleIds.add(change.moduleId);
      }
    });

    return {
      moduleCount: errorModuleIds.size,
      refCount,
      errorModuleIds,
    };
  }, [diffReport]);

  useEffect(() => {
    if (errorStats.moduleCount === 0 && showErrorsOnly) {
      setShowErrorsOnly(false);
    }
  }, [errorStats, showErrorsOnly]);

  useEffect(() => {
    if (showErrorsOnly && errorStats.moduleCount > 0) {
      const toExpand = new Set(collapsedIds);
      let changed = false;
      errorStats.errorModuleIds.forEach((id: any) => {
        if (toExpand.has(id)) {
          toExpand.delete(id);
          changed = true;
        }
      });
      if (changed) setCollapsedIds(toExpand);
    }
  }, [showErrorsOnly, errorStats]);

  const processedGroups = useMemo(() => {
    if (!diffReport) return {};

    const byPath = diffReport.changes.reduce((acc: any, change: any) => {
      const key = change.path || "Main Flow";
      if (!acc[key]) acc[key] = [];
      acc[key].push(change);
      return acc;
    }, {});

    Object.keys(byPath).forEach((path) => {
      const changes = byPath[path];
      const replacements: any[] = [];
      const processedAddedIds = new Set();
      const processedRemovedIds = new Set();
      const removedByIndex = new Map();

      changes
        .filter((c: any) => c.type === "REMOVED")
        .forEach((c: any) => removedByIndex.set(c.index, c));

      changes.forEach((c: any) => {
        if (c.type === "ADDED") {
          const removedMatch = removedByIndex.get(c.index);
          if (removedMatch) {
            replacements.push({
              type: "REPLACEMENT",
              moduleId: c.moduleId,
              newChange: c,
              oldChange: removedMatch,
              index: c.index,
            });
            processedAddedIds.add(c.moduleId);
            processedRemovedIds.add(removedMatch.moduleId);
          }
        }
      });

      changes.forEach((c: any) => {
        if (c.type === "MODIFIED") replacements.push(c);
        else if (c.type === "ADDED" && !processedAddedIds.has(c.moduleId))
          replacements.push(c);
        else if (c.type === "REMOVED" && !processedRemovedIds.has(c.moduleId))
          replacements.push(c);
      });

      replacements.sort((a, b) => (a.index || 0) - (b.index || 0));
      byPath[path] = replacements;
    });

    return byPath;
  }, [diffReport]);

  const sortedGroupKeys = Object.keys(processedGroups).sort((a, b) => {
    if (a === "Scenario Settings") return -1;
    if (b === "Scenario Settings") return 1;
    if (a === "Main Flow") return -1;
    if (b === "Main Flow") return 1;
    return a.localeCompare(b);
  });

  // --- NEW: RECURSIVE COUNT HELPER ---
  // Calculates total items in a path AND all its sub-paths
  const getRecursiveModuleCount = (rootPath: string) => {
    let count = 0;
    Object.keys(processedGroups).forEach((key) => {
      // It matches if it IS the path, or if it starts with "Path ➞ "
      if (key === rootPath || key.startsWith(`${rootPath} ➞ `)) {
        count += processedGroups[key].length;
      }
    });
    return count;
  };

  const wasLabel = isReverse ? "SANDBOX (OLD)" : "PROD (OLD)";
  const becomesLabel = isReverse ? "PROD (NEW)" : "SANDBOX (NEW)";

  const handleScrollToModule = (moduleId: string | number) => {
    const elementId = `module-card-${moduleId}`;
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightedModuleId(moduleId);
      setTimeout(() => {
        setHighlightedModuleId(null);
      }, 2000);
    }
  };

  const BrokenBadge = ({ id }: { id: string }) => (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        background: "#ffebee",
        color: "#c62828",
        border: "1px solid #ffcdd2",
        borderRadius: "4px",
        padding: "2px 6px",
        fontSize: "10px",
        fontWeight: "bold",
        marginLeft: "8px",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
      }}
      title="This reference ID is missing in the current blueprint context"
    >
      ⚠️ BROKEN REFERENCE ID:{id}
    </span>
  );

  const getLevelStyles = (path: string) => {
    if (path === "Scenario Settings" || path === "Main Flow") {
      return { depth: 0, color: "#ccc", indent: 0, label: path };
    }
    const segments = path.split(" ➞ ");
    const depth = segments.length;
    const colors = [
      "#2196f3",
      "#9c27b0",
      "#009688",
      "#ff9800",
      "#e91e63",
      "#795548",
    ];
    const color = colors[(depth - 1) % colors.length];
    const label = segments[segments.length - 1];
    return { depth, color, indent: depth * 20, label };
  };

  const SmartValue = ({ value }: { value: any }) => {
    if (value === undefined) return <span>undefined</span>;
    if (value === null) return <span>null</span>;
    const stringValue =
      typeof value === "object"
        ? JSON.stringify(value, null, 2)
        : String(value);

    if (
      !stringValue.includes("ID:") &&
      !stringValue.includes("{{") &&
      !stringValue.includes("[Unknown") &&
      !stringValue.includes("[Broken")
    ) {
      return (
        <span style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {stringValue}
        </span>
      );
    }

    const parts = stringValue.split(SMART_MATCH_REGEX);
    const elements: React.ReactNode[] = [];
    for (let i = 0; i < parts.length; i += 7) {
      const textSegment = parts[i];
      const friendlyName = parts[i + 1];
      const friendlyId = parts[i + 2];
      const rawMapping = parts[i + 3];
      const rawId = parts[i + 4];
      const brokenMapping = parts[i + 5];
      const brokenId = parts[i + 6];

      if (textSegment)
        elements.push(<span key={`text-${i}`}>{textSegment}</span>);

      if (friendlyName && friendlyId) {
        elements.push(
          <ClickableBadge
            key={`friendly-${i}`}
            id={friendlyId}
            label={friendlyName}
            isRaw={false}
          />,
        );
      } else if (rawMapping && rawId) {
        elements.push(
          <ClickableBadge
            key={`raw-${i}`}
            id={rawId}
            label={rawMapping}
            isRaw={true}
          />,
        );
      } else if (brokenMapping && brokenId) {
        elements.push(
          <span
            key={`broken-${i}`}
            title={`Missing Module ID: ${brokenId}`}
            style={{
              color: "#d32f2f",
              fontWeight: "bold",
              background: "#ffebee",
              borderBottom: "1px dashed #d32f2f",
              padding: "0 2px",
              borderRadius: "2px",
              fontFamily: "monospace",
              cursor: "help",
            }}
          >
            {brokenMapping}
          </span>,
        );
      }
    }
    return (
      <span style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
        {elements}
      </span>
    );
  };

  const ClickableBadge = ({
    id,
    label,
    isRaw,
  }: {
    id: string;
    label: string;
    isRaw: boolean;
  }) => (
    <span
      onClick={(e) => {
        e.stopPropagation();
        handleScrollToModule(id);
      }}
      title={`Scroll to Module ID:${id}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        cursor: "pointer",
        backgroundColor: isRaw ? "#f3e5f5" : "#e1f5fe",
        color: isRaw ? "#7b1fa2" : "#0277bd",
        borderRadius: "4px",
        padding: "0 4px",
        margin: "0 2px",
        fontSize: "10px",
        fontWeight: "bold",
        border: `1px solid ${isRaw ? "#e1bee7" : "#b3e5fc"}`,
        transition: "all 0.2s",
        fontFamily: "monospace",
      }}
    >
      <span style={{ marginRight: "3px" }}>🔗</span>
      {label}
    </span>
  );

  const formatOperator = (op: string) =>
    !op ? "exists" : op.replace(":", " ").toUpperCase();

  const renderFilterSection = (filterChange: any, incomingFrom: string) => {
    if (!filterChange) return null;
    const isNew = filterChange.type === "ADDED";
    const isModified = filterChange.type === "MODIFIED";
    const filterData = isNew
      ? filterChange.newValue
      : filterChange.newValue || filterChange.oldValue;
    const isFallback = filterChange.isFallback;
    const label = filterData?.name || (isFallback ? "Fallback" : "Unnamed");
    const brokenRefs = getBrokenRefs(filterData);

    const renderConditions = (conditions: any[]) => {
      if (!conditions || !Array.isArray(conditions) || conditions.length === 0)
        return <em style={{ fontSize: "11px" }}>No conditions defined</em>;

      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {conditions.map((orGroup, i) => (
            <div key={i} style={{ marginBottom: "4px" }}>
              {i > 0 && (
                <div
                  style={{
                    fontSize: "9px",
                    fontWeight: "bold",
                    textAlign: "center",
                    margin: "2px 0",
                  }}
                >
                  — OR —
                </div>
              )}
              <div
                style={{
                  background: "rgba(255,255,255,0.5)",
                  padding: "4px",
                  borderRadius: "4px",
                }}
              >
                {Array.isArray(orGroup) &&
                  orGroup.map((cond: any, j: number) => (
                    <div
                      key={j}
                      style={{
                        fontSize: "11px",
                        fontFamily: "monospace",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      {j > 0 && (
                        <span style={{ fontSize: "9px", color: "#999" }}>
                          AND
                        </span>
                      )}
                      <span style={{ color: "#2196f3" }}>
                        <SmartValue value={cond.a} />
                      </span>
                      <span style={{ fontWeight: "bold", color: "#555" }}>
                        {formatOperator(cond.o)}
                      </span>
                      <span style={{ color: "#4caf50" }}>
                        <SmartValue value={cond.b} />
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      );
    };

    return (
      <div style={filterSectionStyle}>
        <div style={filterHeaderStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "14px" }}>⚡</span>
            <strong>FILTER: {label}</strong>
            {isFallback && (
              <span
                style={{
                  backgroundColor: "#ff9800",
                  color: "white",
                  fontSize: "9px",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                }}
              >
                🔀 Fallback Route
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {brokenRefs.length > 0 &&
              brokenRefs.map((id) => <BrokenBadge key={id} id={id} />)}
            <div style={{ fontSize: "10px", color: "#555" }}>
              <span style={{ fontWeight: "bold" }}>Bundle flows from:</span>{" "}
              {incomingFrom}
            </div>
          </div>
        </div>

        {isModified ? (
          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ flex: 1, opacity: 0.6 }}>
              <div style={miniLabelStyle}>PREVIOUS LOGIC</div>
              {renderConditions(filterChange.oldValue?.conditions)}
            </div>
            <div style={{ borderLeft: "1px solid #ccc" }}></div>
            <div style={{ flex: 1 }}>
              <div style={miniLabelStyle}>NEW LOGIC</div>
              {renderConditions(filterChange.newValue?.conditions)}
            </div>
          </div>
        ) : (
          <div>{renderConditions(filterData?.conditions)}</div>
        )}
      </div>
    );
  };

  const formatFieldKey = (key: string) =>
    key
      .split(".")
      .map((part) => (isNaN(Number(part)) ? part : `[${part}]`))
      .join(" ➞ ");

  const renderCard = (change: any, isNested = false) => {
    const isHighlighted = highlightedModuleId == change.moduleId;
    const isCollapsed = collapsedIds.has(change.moduleId);
    const hasError = errorStats.errorModuleIds.has(change.moduleId);

    return (
      <div
        id={`module-card-${change.moduleId}`}
        style={{
          ...cardStyle,
          marginBottom: isNested ? "0" : "12px",
          border: isNested
            ? "none"
            : hasError
              ? "1px solid #e57373"
              : isHighlighted
                ? "2px solid #2196f3"
                : cardStyle.border,
          boxShadow: isNested
            ? "none"
            : hasError
              ? "0 0 8px rgba(229, 115, 115, 0.4)"
              : isHighlighted
                ? "0 0 15px rgba(33, 150, 243, 0.4)"
                : cardStyle.boxShadow,
          transform: isHighlighted ? "scale(1.01)" : "scale(1)",
          transition: "all 0.5s ease",
          height: "auto",
        }}
      >
        <div
          onClick={() => toggleCollapse(change.moduleId)}
          style={{
            ...cardHeaderStyle,
            cursor: "pointer",
            background: hasError
              ? "#ffebee"
              : isHighlighted
                ? "#e3f2fd"
                : cardHeaderStyle.background,
            borderBottom: isCollapsed ? "none" : "1px solid #f0f0f0",
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  fontSize: "10px",
                  color: "#999",
                  transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)",
                  transition: "transform 0.2s",
                  display: "inline-block",
                  width: "12px",
                }}
              >
                ▼
              </span>
              <span style={{ fontSize: "16px" }}>
                {change.type === "ADDED"
                  ? "🟢"
                  : change.type === "REMOVED"
                    ? "🔴"
                    : "✏️"}
              </span>
              <strong>{change.module}</strong>
              <span style={badgeStyle}>{change.moduleType}</span>
              {hasError && (
                <span
                  style={{
                    fontSize: "10px",
                    background: "#c62828",
                    color: "white",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    fontWeight: "bold",
                  }}
                >
                  {getBrokenRefs(JSON.stringify(change)).length} ERRORS
                </span>
              )}
            </div>
            <div style={metaRowStyle}>
              <span title="Module ID">🆔 {change.moduleId}</span>
              {change.moduleName && (
                <span title="Raw Metadata Name">🏷️ {change.moduleName}</span>
              )}
            </div>
          </div>
          <div
            style={{
              ...statusLabelStyle,
              color:
                change.type === "ADDED"
                  ? "green"
                  : change.type === "REMOVED"
                    ? "red"
                    : "orange",
            }}
          >
            {change.type}
          </div>
        </div>
        {!isCollapsed && (
          <>
            {change.filterChange &&
              renderFilterSection(change.filterChange, change.incomingFrom)}
            <div style={cardBodyStyle}>
              {change.details && (
                <div style={detailsStyle}>{change.details}</div>
              )}
              {change.changes &&
                change.changes.map((diff: any, i: number) => {
                  const brokenInNew = getBrokenRefs(diff.newValue);
                  return (
                    <div key={i} style={diffRowStyle}>
                      <div style={fieldLabelStyle}>
                        {formatFieldKey(diff.field)}
                      </div>
                      <div style={comparisonContainerStyle}>
                        <div style={oldValueStyle}>
                          <div style={miniLabelStyle}>{wasLabel}</div>
                          <SmartValue value={diff.oldValue} />
                        </div>
                        <div style={arrowStyle}>➔</div>
                        <div style={newValueStyle}>
                          <div style={miniLabelStyle}>{becomesLabel}</div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                            }}
                          >
                            <div style={{ flex: 1 }}>
                              <SmartValue value={diff.newValue} />
                            </div>
                            {brokenInNew.length > 0 && (
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "4px",
                                  alignItems: "flex-end",
                                }}
                              >
                                {brokenInNew.map((id) => (
                                  <BrokenBadge key={id} id={id} />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div>
          <h1 style={{ margin: 0, fontSize: "20px" }}>
            Make.com Topology Diff
          </h1>
          <div style={settingsBarStyle}>
            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={ignoreScenarioName}
                onChange={(e) => setIgnoreScenarioName(e.target.checked)}
              />{" "}
              Ignore Scenario Name
            </label>
            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={ignoreConnections}
                onChange={(e) => setIgnoreConnections(e.target.checked)}
              />{" "}
              Ignore Connection IDs
            </label>
            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={ignoreModuleNames}
                onChange={(e) => setIgnoreModuleNames(e.target.checked)}
              />{" "}
              Ignore Module Renames
            </label>
            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={showRawMappings}
                onChange={(e) => setShowRawMappings(e.target.checked)}
              />{" "}
              Show Raw Mappings
            </label>
            <div
              style={{
                width: "1px",
                height: "14px",
                background: "#ddd",
                margin: "0 5px",
              }}
            ></div>
            <button
              onClick={handleToggleAll}
              style={{
                background: "none",
                border: "none",
                color: "#1976d2",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "bold",
                padding: "0",
                textDecoration: "underline",
              }}
            >
              {isAllExpanded ? "🔽 Collapse All" : "🔼 Expand All"}
            </button>
          </div>
        </div>
        <button
          onClick={() => setIsReverse(!isReverse)}
          style={{
            ...btnStyle,
            width: "auto",
            background: isReverse ? "#ff9800" : "#fff",
            color: isReverse ? "white" : "#555",
            border: "1px solid #ddd",
          }}
        >
          {isReverse ? "⚠️ Mode: Rollback Analysis" : "🔄 Swap View Direction"}
        </button>
      </header>

      <div
        style={{ display: "flex", gap: "15px", flex: 1, overflow: "hidden" }}
      >
        <div style={columnStyle}>
          <h3 style={colHeaderStyle}>
            1. {isReverse ? "Sandbox (Old)" : "Production (Existing)"}
          </h3>
          <button
            onClick={() => fetchBlueprint(isReverse ? "sandbox" : "prod")}
            style={actionBtnStyle}
          >
            Load {isReverse ? "Sandbox" : "Production"}
          </button>
          <textarea
            style={textAreaStyle}
            value={isReverse ? sandboxJson : prodJson}
            onChange={(e) =>
              isReverse
                ? setSandboxJson(e.target.value)
                : setProdJson(e.target.value)
            }
            placeholder="Paste Baseline JSON here..."
          />
        </div>

        <div
          style={{
            ...columnStyle,
            flex: 1.5,
            background: "#f8f9fa",
            borderColor: "#cfd8dc",
          }}
        >
          <h3 style={colHeaderStyle}>2. Change Set</h3>
          {diffReport && (
            <div style={statsBarStyle}>
              <span style={{ color: "#d32f2f" }}>
                ➖ {diffReport.summary.removed} Removed
              </span>
              <span style={{ color: "#2e7d32" }}>
                ➕ {diffReport.summary.added} Added
              </span>
              <span style={{ color: "#f57c00" }}>
                ✏️ {diffReport.summary.modified} Modified
              </span>

              <div
                style={{
                  width: "1px",
                  height: "16px",
                  background: "#ccc",
                  margin: "0 10px",
                }}
              />

              {errorStats.refCount > 0 ? (
                <div
                  onClick={() => setShowErrorsOnly(!showErrorsOnly)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    background: showErrorsOnly ? "#c62828" : "#ffebee",
                    color: showErrorsOnly ? "white" : "#c62828",
                    border: "1px solid #ef9a9a",
                    transition: "all 0.2s",
                  }}
                >
                  <span style={{ fontWeight: "bold" }}>
                    ⚠️ {errorStats.moduleCount} Modules / {errorStats.refCount}{" "}
                    Broken Refs
                  </span>
                  <span
                    style={{ fontSize: "10px", textDecoration: "underline" }}
                  >
                    {showErrorsOnly ? "Show All" : "Filter Errors"}
                  </span>
                </div>
              ) : (
                <span style={{ color: "#aaa", fontSize: "11px" }}>
                  ✅ No Reference Errors
                </span>
              )}
            </div>
          )}
          <div style={scrollContainer}>
            {!diffReport ? (
              <div style={emptyStateStyle}>
                Add both blueprints to generate report.
              </div>
            ) : diffReport.changes.length === 0 ? (
              <div style={successStateStyle}>✅ No Logic Changes Detected</div>
            ) : (
              sortedGroupKeys.map((path) => {
                const { depth, color, indent, label } = getLevelStyles(path);
                const isPathCollapsed = collapsedPaths.has(path);

                // --- HIERARCHICAL COLLAPSE CHECK ---
                // If any ANCESTOR of this path is collapsed, do not render this entire block
                // e.g. if "Main Flow" is collapsed, "Main Flow ➞ Route 1" should return null
                const closestCollapsedAncestor = sortedGroupKeys.find(
                  (potentialAncestor) =>
                    collapsedPaths.has(potentialAncestor) &&
                    path.startsWith(potentialAncestor + " ➞ "),
                );

                if (closestCollapsedAncestor) {
                  return null;
                }

                // FILTERING LOGIC
                const groupItems = processedGroups[path];
                const filteredItems = showErrorsOnly
                  ? groupItems.filter((item: any) => {
                      const id =
                        item.type === "REPLACEMENT"
                          ? item.moduleId
                          : item.moduleId;
                      return errorStats.errorModuleIds.has(id);
                    })
                  : groupItems;

                if (filteredItems.length === 0) return null;

                // RECURSIVE COUNT
                // If collapsed, count everything in this path AND its sub-paths
                const hiddenCount = isPathCollapsed
                  ? getRecursiveModuleCount(path)
                  : 0;

                return (
                  <div
                    key={path}
                    style={{
                      marginBottom: "20px",
                      marginLeft: `${indent}px`,
                      borderLeft: depth > 0 ? `4px solid ${color}` : "none",
                      paddingLeft: depth > 0 ? "15px" : "0",
                    }}
                  >
                    {/* CLICKABLE PATH HEADER */}
                    <div
                      onClick={() => togglePathCollapse(path)}
                      style={{
                        ...pathHeaderStyle,
                        color: depth > 0 ? color : "#999",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                      title="Click to toggle modules in this path"
                    >
                      <span
                        style={{
                          fontSize: "10px",
                          display: "inline-block",
                          transform: isPathCollapsed
                            ? "rotate(-90deg)"
                            : "rotate(0deg)",
                          transition: "transform 0.2s",
                        }}
                      >
                        ▼
                      </span>
                      <span>
                        {depth > 0 && (
                          <span
                            style={{ marginRight: "8px", fontSize: "14px" }}
                          >
                            ↳
                          </span>
                        )}
                        {depth > 0 ? label : `📂 ${label}`}
                      </span>
                    </div>

                    {/* PATH CONTENT OR PLACEHOLDER */}
                    {isPathCollapsed ? (
                      <div
                        style={{
                          padding: "8px",
                          background: "#f5f5f5",
                          borderRadius: "4px",
                          color: "#777",
                          fontSize: "12px",
                          fontStyle: "italic",
                          border: "1px dashed #ddd",
                        }}
                      >
                        ℹ️ {hiddenCount}{" "}
                        {hiddenCount === 1 ? "change" : "changes"} hidden across
                        this and sub-routes.
                      </div>
                    ) : (
                      filteredItems.map((item: any, idx: number) => {
                        if (item.type === "REPLACEMENT") {
                          return (
                            <div key={idx} style={replacementWrapperStyle}>
                              <div style={replacementHeaderStyle}>
                                <strong>🔄 Module Replaced</strong>
                                <span
                                  style={{ fontSize: "11px", opacity: 0.8 }}
                                >
                                  ID: {item.moduleId}
                                </span>
                              </div>
                              <div style={{ opacity: 0.7 }}>
                                {renderCard(item.oldChange, true)}
                              </div>
                              <div style={replacementArrowStyle}>
                                ⬇️ Replaced By ⬇️
                              </div>
                              <div>{renderCard(item.newChange, true)}</div>
                            </div>
                          );
                        }
                        return <div key={idx}>{renderCard(item)}</div>;
                      })
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div style={columnStyle}>
          <h3 style={colHeaderStyle}>
            3. {isReverse ? "Production (Rollback)" : "Sandbox (Proposed)"}
          </h3>
          <button
            onClick={() => fetchBlueprint(isReverse ? "prod" : "sandbox")}
            style={actionBtnStyle}
          >
            Load {isReverse ? "Production" : "Sandbox"}
          </button>
          <textarea
            style={textAreaStyle}
            value={isReverse ? prodJson : sandboxJson}
            onChange={(e) =>
              isReverse
                ? setProdJson(e.target.value)
                : setSandboxJson(e.target.value)
            }
            placeholder="Paste Proposed JSON here..."
          />
        </div>
      </div>
    </div>
  );
}

// --- STYLES (unchanged) ---
const filterSectionStyle: React.CSSProperties = {
  background: "#e3f2fd",
  borderBottom: "1px solid #bbdefb",
  padding: "10px",
  fontSize: "12px",
};
const filterHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "8px",
  color: "#1565c0",
};
const settingsBarStyle: React.CSSProperties = {
  display: "flex",
  gap: "15px",
  marginTop: "5px",
  fontSize: "12px",
  color: "#666",
};
const checkboxLabelStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "5px",
  cursor: "pointer",
  userSelect: "none",
};
const containerStyle: React.CSSProperties = {
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  padding: "15px",
  boxSizing: "border-box",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  color: "#333",
  background: "#fcfcfc",
};
const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "15px",
  borderBottom: "1px solid #eee",
  paddingBottom: "15px",
};
const columnStyle: React.CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  border: "1px solid #e0e0e0",
  borderRadius: "8px",
  backgroundColor: "white",
  overflow: "hidden",
  boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
};
const colHeaderStyle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: 700,
  padding: "12px 12px 4px 12px",
  margin: 0,
  background: "#fff",
  color: "#222",
};
const textAreaStyle: React.CSSProperties = {
  flex: 1,
  resize: "none",
  border: "none",
  padding: "10px",
  fontSize: "11px",
  fontFamily: "Monaco, monospace",
  outline: "none",
  background: "#fff",
  color: "#444",
};
const scrollContainer: React.CSSProperties = {
  flex: 1,
  overflowY: "auto",
  padding: "15px",
};
const statsBarStyle: React.CSSProperties = {
  display: "flex",
  gap: "20px",
  padding: "10px 15px",
  background: "#fff",
  borderBottom: "1px solid #e0e0e0",
  fontSize: "12px",
  fontWeight: "bold",
  justifyContent: "center",
  alignItems: "center",
};
const pathHeaderStyle: React.CSSProperties = {
  fontSize: "11px",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  color: "#999",
  fontWeight: "bold",
  marginBottom: "10px",
  borderBottom: "1px solid #eee",
  paddingBottom: "5px",
};
const cardStyle: React.CSSProperties = {
  background: "white",
  borderRadius: "6px",
  border: "1px solid #e0e0e0",
  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  marginBottom: "12px",
  overflow: "hidden",
  position: "relative",
};
const cardHeaderStyle: React.CSSProperties = {
  padding: "8px 12px",
  background: "#fcfcfc",
  borderBottom: "1px solid #f0f0f0",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  fontSize: "13px",
  transition: "background 0.3s ease",
};
const cardBodyStyle: React.CSSProperties = { padding: "0" };
const badgeStyle: React.CSSProperties = {
  fontSize: "10px",
  background: "#f0f0f0",
  color: "#666",
  padding: "2px 6px",
  borderRadius: "10px",
  fontFamily: "monospace",
  border: "1px solid #e0e0e0",
};
const metaRowStyle: React.CSSProperties = {
  marginTop: "4px",
  fontSize: "10px",
  color: "#888",
  display: "flex",
  gap: "10px",
  paddingLeft: "28px",
};
const statusLabelStyle: React.CSSProperties = {
  fontSize: "10px",
  fontWeight: "bold",
  textAlign: "right",
  marginLeft: "10px",
};
const detailsStyle: React.CSSProperties = {
  padding: "10px",
  color: "#666",
  fontSize: "12px",
  fontStyle: "italic",
};
const diffRowStyle: React.CSSProperties = {
  borderBottom: "1px solid #f5f5f5",
  fontSize: "12px",
};
const fieldLabelStyle: React.CSSProperties = {
  padding: "6px 12px",
  background: "#fafafa",
  color: "#666",
  fontWeight: 600,
  fontSize: "11px",
  borderBottom: "1px solid #f0f0f0",
  fontFamily: "Monaco, monospace",
};
const comparisonContainerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "stretch",
};
const oldValueStyle: React.CSSProperties = {
  flex: 1,
  padding: "8px 12px",
  background: "#fff0f0",
  color: "#c62828",
  fontFamily: "Monaco, monospace",
  fontSize: "11px",
  position: "relative",
  borderRight: "1px solid #fce4ec",
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
};
const newValueStyle: React.CSSProperties = {
  flex: 1,
  padding: "8px 12px",
  background: "#f1f8e9",
  color: "#2e7d32",
  fontFamily: "Monaco, monospace",
  fontSize: "11px",
  position: "relative",
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
};
const arrowStyle: React.CSSProperties = {
  padding: "0 8px",
  background: "#fff",
  color: "#bbb",
  display: "flex",
  alignItems: "center",
  fontSize: "14px",
  fontWeight: "bold",
};
const miniLabelStyle: React.CSSProperties = {
  fontSize: "8px",
  opacity: 0.6,
  textTransform: "uppercase",
  marginBottom: "4px",
  fontWeight: "bold",
};
const emptyStateStyle: React.CSSProperties = {
  textAlign: "center",
  color: "#bbb",
  marginTop: "50px",
  fontSize: "14px",
};
const successStateStyle: React.CSSProperties = {
  textAlign: "center",
  color: "#2e7d32",
  fontWeight: "bold",
  marginTop: "40px",
  padding: "30px",
  background: "#e8f5e9",
  borderRadius: "8px",
  border: "1px dashed #a5d6a7",
};
const btnStyle: React.CSSProperties = {
  padding: "6px 12px",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: 600,
  border: "none",
};
const actionBtnStyle: React.CSSProperties = {
  ...btnStyle,
  margin: "10px",
  background: "#f5f5f5",
  border: "1px solid #ddd",
  color: "#333",
  width: "calc(100% - 20px)",
};
const replacementWrapperStyle: React.CSSProperties = {
  border: "2px dashed #90caf9",
  borderRadius: "8px",
  padding: "10px",
  background: "#e3f2fd",
  marginBottom: "20px",
  position: "relative",
};
const replacementHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "10px",
  color: "#1976d2",
  fontSize: "12px",
};
const replacementArrowStyle: React.CSSProperties = {
  textAlign: "center",
  fontSize: "10px",
  fontWeight: "bold",
  color: "#1976d2",
  padding: "5px 0",
  textTransform: "uppercase",
  letterSpacing: "1px",
};

export default App;
