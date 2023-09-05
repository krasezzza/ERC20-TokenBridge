import { Navigate } from 'react-router-dom';
import { useAccount } from 'wagmi';

const ProtectedRoute = ({ children }) => {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
