import { Navigate, Outlet } from 'react-router-dom';

const PrivateRouter = () => {
    const isAuthenticated = !!localStorage.getItem('accessToken');
    return isAuthenticated ? <Outlet /> : <Navigate to="/auth" replace />;
};

export default PrivateRouter;

