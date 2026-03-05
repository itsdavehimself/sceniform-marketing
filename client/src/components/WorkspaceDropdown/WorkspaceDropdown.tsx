import React, { useState, useRef, useEffect } from "react";
import styles from "./WorkspaceDropdown.module.scss";
import {
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Building2,
  Users,
  CircleAlert,
} from "lucide-react";
import type { WorkspaceGroup } from "../../context/MakeContext";

interface WorkspaceDropdownProps {
  groups: WorkspaceGroup[];
  selectedOrgId: number | null | undefined;
  selectedTeamId: number | null | undefined;
  onSelect: (orgId: number, teamId: number) => void;
  placeholder?: string;
  availableZones?: string[]; // <-- Add prop
}

const WorkspaceDropdown: React.FC<WorkspaceDropdownProps> = ({
  groups,
  selectedOrgId,
  selectedTeamId,
  onSelect,
  placeholder = "Select Workspace...",
  availableZones = [], // <-- Default to empty array
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedOrgs, setExpandedOrgs] = useState<Record<string, boolean>>({});
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedOrgId) {
      setExpandedOrgs((prev) => ({ ...prev, [selectedOrgId]: true }));
    }
  }, [selectedOrgId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOrg = (orgId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedOrgs((prev) => ({ ...prev, [orgId]: !prev[orgId] }));
  };

  const handleSelect = (orgId: number, teamId: number) => {
    onSelect(orgId, teamId);
    setIsOpen(false);
  };

  const getSelectedName = () => {
    if (!selectedOrgId || !selectedTeamId) {
      return <p className={styles.defaultOption}>{placeholder}</p>;
    }
    const org = groups.find((g) => g.orgId === selectedOrgId);
    const team = org?.teams.find((t) => t.id === selectedTeamId);

    if (org && team) {
      return (
        <p className={styles.selectedName}>
          <span style={{ color: "inherit", opacity: 0.6, fontWeight: 400 }}>
            {org.orgName} /{" "}
          </span>
          {team.name}
        </p>
      );
    }
    return <p className={styles.defaultOption}>{placeholder}</p>;
  };

  return (
    <div
      className={styles.customDropdownContainer}
      ref={dropdownRef}
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className={styles.selectBox}>
        <span className={styles.selectedName}>{getSelectedName()}</span>
        <span className={styles.selectBoxIcon}>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </div>

      {isOpen && (
        <div className={styles.dropdownMenu}>
          {groups.map((group) => {
            const isExpanded = expandedOrgs[group.orgId];

            // <-- SAFELY EXTRACT "us1" from "us1.make.com" AND COMPARE
            const groupZoneShort = group.zone ? group.zone.split(".")[0] : "";
            const isMissingKey =
              availableZones.length > 0 &&
              !availableZones.includes(groupZoneShort);

            return (
              <div key={group.orgId} className={styles.orgGroup}>
                <div
                  className={styles.orgHeader}
                  onClick={(e) => toggleOrg(group.orgId.toString(), e)}
                >
                  <span className={styles.caret}>
                    {isExpanded ? (
                      <ChevronDown size={12} />
                    ) : (
                      <ChevronRight size={12} />
                    )}
                  </span>
                  <div className={styles.orgTitle}>
                    <Building2 size={14} />
                    <div>{group.orgName}</div>
                  </div>

                  {isMissingKey && (
                    <div
                      className={styles.missingKeyWarning}
                      title="You do not have an API key saved for this workspace's zone. Scenario blueprints will not load."
                    >
                      <div className={styles.redDot}></div>
                    </div>
                  )}
                </div>

                {isExpanded && (
                  <div className={styles.teamList}>
                    {group.teams.length === 0 ? (
                      <div className={styles.emptyText}>No teams found</div>
                    ) : (
                      group.teams.map((team) => (
                        <div
                          key={team.id}
                          className={`${styles.teamItem} ${
                            selectedTeamId === team.id
                              ? styles.selectedItem
                              : ""
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelect(group.orgId, team.id);
                          }}
                        >
                          <Users size={14} /> <div>{team.name}</div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WorkspaceDropdown;
