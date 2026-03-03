import MakeConnect from "../../components/MakeConnect/MakeConnect";
import styles from "./Onboarding.module.scss";

const Onboarding: React.FC = () => {
  return (
    <main className={styles.onboarding}>
      <MakeConnect />
    </main>
  );
};

export default Onboarding;
