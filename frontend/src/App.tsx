import { Routes, Route } from 'react-router';
import Home from './pages/Home';
import Login from './pages/Login';
import OperationsPanel from './pages/OperationsPanel';

/**
 * Componente principal da aplicação
 * Gerencia rotas e navegação
 */
function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<OperationsPanel />} />
    </Routes>
  );
}

export default App;
