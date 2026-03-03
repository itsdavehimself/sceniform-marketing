import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import styles from "./Dropdown.module.scss";
import { ChevronDown, ChevronUp } from "lucide-react";

export interface DropdownOption {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  className?: string;
  size?: "sm" | "lg";
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  className = "",
  size = "sm",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const [menuCoords, setMenuCoords] = useState({ left: 0, top: 0, width: 0 });

  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      setMenuCoords({
        left: rect.left,
        top: rect.bottom + 4,
        width: rect.width,
      });
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleScroll = (event: Event) => {
      if (
        isOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", () => setIsOpen(false));

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", () => setIsOpen(false));
    };
  }, [isOpen]);

  const handleSelect = (
    selectedValue: string | number,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    onChange(selectedValue);
    setIsOpen(false);
  };

  const selectedOption = options.find((opt) => opt.value === value);

  const isDarkMode =
    document.documentElement.classList.contains("dark") ||
    document.body.classList.contains("dark");

  return (
    <div
      className={`${styles.customDropdownContainer} ${className} ${styles[size]}`}
      ref={dropdownRef}
      onClick={handleToggle}
    >
      <div className={styles.selectBox}>
        {selectedOption ? (
          <div className={styles.selectedNameContainer}>
            {selectedOption.icon && (
              <span className={styles.iconWrapper}>{selectedOption.icon}</span>
            )}
            <span className={styles.selectedName}>{selectedOption.label}</span>
          </div>
        ) : (
          <span className={styles.defaultOption}>{placeholder}</span>
        )}
        <span className={styles.selectBoxIcon}>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </div>

      {isOpen &&
        createPortal(
          <div className={isDarkMode ? "dark" : ""}>
            <div
              ref={menuRef}
              className={styles.dropdownMenu}
              style={{
                position: "fixed",
                top: `${menuCoords.top}px`,
                left: `${menuCoords.left}px`,
                width: `${menuCoords.width}px`,
                zIndex: 99999,
              }}
            >
              {options.length === 0 ? (
                <div className={styles.emptyText}>No options available</div>
              ) : (
                options.map((option) => (
                  <div
                    key={option.value}
                    className={`${styles.optionItem} ${
                      value === option.value ? styles.selectedItem : ""
                    }`}
                    onClick={(e) => handleSelect(option.value, e)}
                  >
                    {option.icon && (
                      <span className={styles.iconWrapper}>{option.icon}</span>
                    )}
                    <span className={styles.optionLabel}>{option.label}</span>
                  </div>
                ))
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default Dropdown;
