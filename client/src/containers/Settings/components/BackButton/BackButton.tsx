import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import styles from "./BackButton.module.scss";

const BackButton: React.FC = () => {
  const navigate = useNavigate();
  return (
    <button onClick={() => navigate("/settings")} className={styles.backBtn}>
      <ArrowLeft size={24} />
    </button>
  );
};

export default BackButton;
