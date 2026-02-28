import React from "react";
import styles from "./SquareButton.module.scss";

interface SquareButtonProps {
  onClick: () => void;
  title: string;
  icon: React.ReactNode;
}

const SquareButton: React.FC<SquareButtonProps> = ({
  onClick,
  title,
  icon,
}) => {
  return (
    <button onClick={onClick} className={styles.controlButton} title={title}>
      {icon}
    </button>
  );
};

export default SquareButton;
