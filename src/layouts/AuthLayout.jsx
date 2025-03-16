// layouts/AuthLayout.jsx
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="auth-layout">
      {/* <h1>App Logo/Header</h1> */}
      <Outlet /> {/* This renders child routes */}
    </div>
  );
}

export default AuthLayout;