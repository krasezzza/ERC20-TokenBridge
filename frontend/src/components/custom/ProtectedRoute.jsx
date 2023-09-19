import { Navigate } from 'react-router-dom';
import { useAccount } from 'wagmi';

export default function ProtectedRoute ({ children }) {

  const { isConnected } = useAccount();

  if (!isConnected) {
    return <Navigate to="/" replace/>;
  }

  return children;
};
