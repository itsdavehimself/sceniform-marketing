import React from "react";
import styles from "./Page404.module.scss";
import travolta from "../../assets/confused-travolta.png";
import ActionButton from "../../components/ActionButton/ActionButton";

const Page404: React.FC = () => {
  const handleReturnHome = () => {
    window.location.href = "https://sceniform.com";
  };

  return (
    <main className={styles.container404}>
      <div className={styles.imageContainer}>
        <img src={travolta} alt="Execution Halted" />
      </div>

      <div className={styles.textContainer}>
        <h1>404: Node Not Found.</h1>
        <p>Warm, warmer... 404. This route is missing from our blueprint.</p>
      </div>

      <ActionButton
        title="Return to Sceniform"
        variant="secondary"
        size="lg"
        onClick={handleReturnHome}
      />
    </main>
  );
};

export default Page404;
