import styles from "./SmartValue.module.scss";
import ClickableBadge from "../../../ClickableBadge/ClickableBadge";

const SMART_MATCH_REGEX =
  /\[(.*?) ID:(\d+)\]|(\{\{(\d+)\.[^}]*\}\})|(\{\{\[(?:Unknown|Missing Reference|Broken Reference)-(\d+)\].*?\}\})/g;

interface SmartValueProps {
  value: any;
  handleScrollToModule: (id: string | number) => void;
}

const SmartValue: React.FC<SmartValueProps> = ({
  value,
  handleScrollToModule,
}) => {
  if (value === undefined) return <span>undefined</span>;
  if (value === null) return <span>null</span>;

  const stringValue =
    typeof value === "object" ? JSON.stringify(value, null, 2) : String(value);

  if (
    !stringValue.includes("ID:") &&
    !stringValue.includes("{{") &&
    !stringValue.includes("[Unknown") &&
    !stringValue.includes("[Broken")
  ) {
    return <span className={styles.textWrapper}>{stringValue}</span>;
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
          handleScrollToModule={handleScrollToModule}
        />,
      );
    } else if (rawMapping && rawId) {
      elements.push(
        <ClickableBadge
          key={`raw-${i}`}
          id={rawId}
          label={rawMapping}
          isRaw={true}
          handleScrollToModule={handleScrollToModule}
        />,
      );
    } else if (brokenMapping && brokenId) {
      elements.push(
        <span
          key={`broken-${i}`}
          title={`Missing Module ID: ${brokenId}`}
          className={styles.brokenText}
        >
          {brokenMapping}
        </span>,
      );
    }
  }

  return <span className={styles.textWrapper}>{elements}</span>;
};

export default SmartValue;
