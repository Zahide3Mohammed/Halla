import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children }) => {
    const { user , token } = useAuth();
    
    if (!token || !user) {
    return <Navigate to="/login" replace  state={{ signin: true }}/>;
  }
    return children;
};
