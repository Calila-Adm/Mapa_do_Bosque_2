import { Routes, Route } from 'react-router';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import OperationsPanel from './pages/OperationsPanel';
import InstagramPanel from './pages/InstagramPanel';
import LoginFigma from './pages/test/LoginFigma';

/**
 * Componente principal da aplicação
 * Gerencia rotas, navegação e autenticação
 */
function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/login-figma" element={<LoginFigma />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <OperationsPanel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operations"
          element={
            <ProtectedRoute>
              <OperationsPanel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/instagram"
          element={
            <ProtectedRoute>
              <InstagramPanel />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
