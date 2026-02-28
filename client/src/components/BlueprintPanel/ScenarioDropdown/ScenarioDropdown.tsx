import React, { useState, useRef, useEffect } from "react";
import styles from "./ScenarioDropdown.module.scss";
import {
  ChevronDown,
  ChevronUp,
  Folder,
  ChevronRight,
  Share2,
  Circle,
} from "lucide-react";

interface ScenarioDropdownProps {
  folders: any[];
  selectedId: string;
  onSelectChange: (id: string) => void;
}

const ScenarioDropdown: React.FC<ScenarioDropdownProps> = ({
  folders,
  selectedId,
  onSelectChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<
    Record<string, boolean>
  >({});
  const dropdownRef = useRef<HTMLDivElement>(null);
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

  const toggleFolder = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  const handleSelect = (scenarioId: string) => {
    onSelectChange(scenarioId);
    setIsOpen(false);
  };

  const getSelectedName = () => {
    if (!selectedId)
      return <p className={styles.defaultOption}>Select a scenario</p>;
    for (const folder of folders) {
      const found = folder.scenarios.find(
        (s: any) => s.id.toString() === selectedId.toString(),
      );
      if (found) return found.name;
    }
    return <p className={styles.defaultOption}>Select a scenario</p>;
  };

  return (
    <div className={styles.customDropdownContainer} ref={dropdownRef}>
      <div className={styles.selectBox} onClick={() => setIsOpen(!isOpen)}>
        <span className={styles.selectedName}>{getSelectedName()}</span>
        <span className={styles.selectBoxIcon}>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </div>

      {isOpen && (
        <div className={styles.dropdownMenu}>
          {folders.map((folder) => {
            const folderKey = folder.id || folder.name;
            const isExpanded = expandedFolders[folderKey];

            return (
              <div key={folderKey} className={styles.folderGroup}>
                <div
                  className={styles.folderHeader}
                  onClick={(e) => toggleFolder(folderKey, e)}
                >
                  <span className={styles.caret}>
                    {isExpanded ? (
                      <ChevronDown size={12} />
                    ) : (
                      <ChevronRight size={12} />
                    )}
                  </span>
                  <div className={styles.folderItem}>
                    <Folder size={14} />
                    <div>
                      {folder.name} ({folder.scenarios.length})
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className={styles.scenarioList}>
                    {folder.scenarios.length === 0 ? (
                      <div className={styles.emptyText}>No scenarios</div>
                    ) : (
                      folder.scenarios.map((scenario: any) => (
                        <div
                          key={scenario.id}
                          className={`${styles.scenarioItem} ${
                            selectedId === scenario.id.toString()
                              ? styles.selectedItem
                              : ""
                          }`}
                          onClick={() => handleSelect(scenario.id.toString())}
                        >
                          <div className={styles.scenarioLabel}>
                            <Share2 size={14} /> <div>{scenario.name}</div>
                          </div>
                          <div
                            className={`${styles.circle} ${scenario.isActive ? styles.active : styles.inactive}`}
                          ></div>
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

export default ScenarioDropdown;
