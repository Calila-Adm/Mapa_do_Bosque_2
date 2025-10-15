import { Routes, Route } from 'react-router';
import Home from './pages/Home';
import Login from './pages/Login';
import './App.css';

/**
 * Componente principal da aplicação
 * Gerencia rotas e navegação
 */
function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

export default App;
