import { Navigate } from "react-router-dom";
import type { ReactElement } from "react";

const ProtectedRoute = ({ children }: { children: ReactElement }) => {
  // const user = useAppSelector((state) => state.user.user);
  // const loading = useAppSelector((state) => state.user.loading);

  // if (loading) return <div>Loading...</div>;

  // if (!user) {
  //   return <Navigate to="/" replace />;
  // }

  return children;
};

export default ProtectedRoute;
