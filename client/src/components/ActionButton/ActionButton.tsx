import styles from "./ActionButton.module.scss";

type ButtonVariant = "primary" | "secondary" | "outline" | "disabled";

interface ActionButtonProps {
  title: string;
  onClick: () => void;
  variant?: ButtonVariant;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  title,
  onClick,
  variant = "primary",
}) => {
  const buttonClass = `${styles.actionButton} ${styles[variant]}`;
  const isDisabled = variant === "disabled";

  return (
    <button className={buttonClass} onClick={onClick} disabled={isDisabled}>
      {title}
    </button>
  );
};

export default ActionButton;
