import styles from "./ActionButton.module.scss";

type ButtonVariant = "primary" | "secondary" | "outline" | "danger";

interface ActionButtonProps {
  title: string;
  onClick?: () => void;
  variant?: ButtonVariant;
  type?: "button" | "submit" | "reset" | undefined;
  disabled?: boolean;
  size?: "sm" | "lg";
}

const ActionButton: React.FC<ActionButtonProps> = ({
  title,
  onClick,
  variant = "primary",
  type = "button",
  disabled,
  size = "sm",
}) => {
  const buttonClass = `
    ${styles.actionButton} 
    ${styles[variant]}
    ${styles[size]} 
    ${disabled ? styles.disabled : ""}
  `.trim();

  return (
    <button
      className={buttonClass}
      onClick={onClick}
      disabled={disabled}
      type={type}
    >
      {title}
    </button>
  );
};

export default ActionButton;
