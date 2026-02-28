import React from "react";
import Portal from "../Portal/Portal";
import { X } from "lucide-react";
import styles from "./Modal.module.scss";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}) => {
  if (!isOpen) return null;

  return (
    <Portal>
      <div className={styles.backdrop} onClick={onClose}>
        <div
          className={`${styles.modalCard} ${styles[size]}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.header}>
            <h2>{title}</h2>
            <button className={styles.closeButton} onClick={onClose}>
              <X size={16} strokeWidth={2.5} />
            </button>
          </div>

          <div className={styles.body}>{children}</div>
        </div>
      </div>
    </Portal>
  );
};

export default Modal;
