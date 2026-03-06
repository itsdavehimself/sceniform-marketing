import styles from "./ActionButton.module.scss";

type ButtonVariant = "primary" | "secondary" | "outline" | "danger";

interface ActionButtonProps {
  title: string;
  onClick?: () => void;
  variant?: ButtonVariant;
  type?: "button" | "submit" | "reset" | undefined;
  disabled?: boolean;
  size?: "sm" | "lg";
  fontSize?: "sm" | "lg";
}

const ActionButton: React.FC<ActionButtonProps> = ({
  title,
  onClick,
  variant = "primary",
  type = "button",
  disabled,
  size = "sm",
  fontSize = "sm",
}) => {
  const fontSizeClass = fontSize === "lg" ? styles.fontLg : styles.fontSm;

  const buttonClass = `
  ${styles.actionButton} 
  ${styles[variant]} 
  ${styles[size]} 
  ${fontSizeClass}
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
