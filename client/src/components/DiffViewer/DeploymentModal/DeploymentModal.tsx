import ActionButton from "../../ActionButton/ActionButton";
import styles from "./DeploymentModal.module.scss";
import { useConnections } from "../../../hooks/useConnections";

interface DeploymentModalProps {
  isReverse: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleDeploy: () => void;
}

const DeploymentModal: React.FC<DeploymentModalProps> = ({
  isReverse,
  setIsModalOpen,
  handleDeploy,
}) => {
  const { connections, isLoading } = useConnections();
  console.log("connections", connections);
  return (
    <div className={styles.deploymentModal}>
      <p>Please confirm your module connections before deploying:</p>
      <div className={styles.buttonContainer}>
        <ActionButton
          title="Cancel"
          variant="secondary"
          onClick={() => setIsModalOpen(false)}
        />
        <ActionButton
          title="Deploy"
          variant="primary"
          onClick={() => handleDeploy()}
        />
      </div>
    </div>
  );
};

export default DeploymentModal;
