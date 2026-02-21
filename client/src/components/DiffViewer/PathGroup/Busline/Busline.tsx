import styles from "./Busline.module.scss";

interface BuslineProps {
  color: string;
  isErrorFlow: boolean;
  isDarkMode: boolean;
}

const Busline: React.FC<BuslineProps> = ({
  color,
  isErrorFlow,
  isDarkMode,
}) => {
  const backgroundColor = isErrorFlow
    ? isDarkMode
      ? `${color}33`
      : `${color}22`
    : color;

  const border = isErrorFlow ? `1px solid ${color}` : "none";

  return <div className={styles.busline} style={{ backgroundColor, border }} />;
};

export default Busline;
