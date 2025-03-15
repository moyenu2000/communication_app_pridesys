import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { AppStateProvider } from '../contexts/AppStateContext';
import { ChatStateProvider } from '../contexts/ChatStateContext';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

// Layout Components
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';

// Pages
import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import Channels from '../pages/Channels';
import ChannelDetail from '../pages/ChannelDetail';
import DirectMessages from '../pages/DirectMessages';
import UserProfile from '../pages/UserProfile';
import Settings from '../pages/Settings';
import NotFound from '../pages/NotFound';
import { WebSocketProvider } from '../contexts/WebSocketContext';
import { InformationProvider } from '../contexts/InformationContext';

function Router() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <InformationProvider>
      <AppStateProvider>
        <ChatStateProvider>
        <WebSocketProvider>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicRoute />}>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
            </Route>
          </Route>

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Navigate to="/channels" replace />} />
              <Route path="/channels" element={<Channels />}>
                <Route path=":channelId" element={<ChannelDetail />} />
              </Route>
              <Route path="/messages/:userId" element={<DirectMessages />} />
              <Route path="/users/:userId" element={<UserProfile />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>

          {/* Catch-all Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </WebSocketProvider>
        </ChatStateProvider>
      </AppStateProvider>
      </InformationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default Router;
