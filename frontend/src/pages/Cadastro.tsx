import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import grupoJccLogo from '../assets/Grupo JCC.svg';

/**
 * Página de Cadastro
 * Integrada com a API de autenticação
 */
export function Cadastro() {
  const navigate = useNavigate();
  const { cadastro } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    cargo: '',
    setor: '',
  });
  const [setorOutros, setSetorOutros] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Função para normalizar o texto do setor "Outros"
  // Remove espaços extras e deixa apenas a primeira letra maiúscula
  const normalizeSetorOutros = (text: string): string => {
    // Remove espaços antes e depois
    const trimmed = text.trim();

    if (!trimmed) return '';

    // Separa por espaços e remove espaços vazios
    const words = trimmed.split(/\s+/).filter(word => word.length > 0);

    // Junta as palavras com um único espaço
    const joined = words.join(' ').toLowerCase();

    // Primeira letra maiúscula apenas
    return joined.charAt(0).toUpperCase() + joined.slice(1);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: value,
      };

      // Se mudou o setor e não é "Outros", limpa o campo setorOutros
      if (name === 'setor' && value !== 'Outros') {
        setSetorOutros('');
      }

      // Gera username automaticamente baseado em first_name e last_name
      if (name === 'first_name' || name === 'last_name') {
        const firstName = name === 'first_name' ? value : prev.first_name;
        const lastName = name === 'last_name' ? value : prev.last_name;

        if (firstName && lastName) {
          // Remove acentos e converte para minúsculas
          const normalizeString = (str: string) => {
            return str
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .toLowerCase()
              .trim();
          };

          const usernameGenerated = `${normalizeString(firstName)}.${normalizeString(lastName)}`;
          newData.username = usernameGenerated;
        } else if (firstName && !lastName) {
          // Se só tiver primeiro nome, usa só ele
          const normalizeString = (str: string) => {
            return str
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .toLowerCase()
              .trim();
          };
          newData.username = normalizeString(firstName);
        }
      }

      return newData;
    });
  };

  const handleSetorOutrosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSetorOutros(value);

    // Normaliza e atualiza o campo setor no formData
    const normalized = normalizeSetorOutros(value);
    setFormData((prev) => ({
      ...prev,
      setor: normalized || 'Outros',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validação básica
    if (formData.password !== formData.password_confirm) {
      setError('As senhas não coincidem.');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.');
      setIsLoading(false);
      return;
    }

    try {
      await cadastro(formData);
      navigate('/dashboard'); // Redireciona após cadastro
    } catch (err: any) {
      const errorMsg = err?.message || 'Erro ao cadastrar. Verifique os dados e tente novamente.';
      setError(errorMsg);
      console.error('Erro no cadastro:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      {/* Background com gradiente */}
      <div className="fixed top-0 left-0 w-full h-full bg-gradient-to-br from-primary to-dark z-[1]" />

      {/* Overlay escuro */}
      <div className="fixed top-0 left-0 w-full h-full bg-[rgba(13,13,13,0.6)] z-[2]" />

      {/* Card de Cadastro */}
      <div className="relative z-[3] bg-white rounded-lg shadow-xl p-12 w-full max-w-[600px] flex flex-col gap-6 my-8">
        {/* Logo */}
        <div className="flex justify-center mb-2">
          <img src={grupoJccLogo} alt="Logo Grupo JCC" className="w-[250px] h-auto" />
        </div>

        {/* Título */}
        <h1 className="text-3xl font-bold text-dark text-center">
          Criar nova conta
        </h1>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Mensagem de erro */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Nome */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="first_name">Nome</Label>
              <Input
                id="first_name"
                name="first_name"
                type="text"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Osman"
              />
            </div>

            {/* Sobrenome */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="last_name">Sobrenome</Label>
              <Input
                id="last_name"
                name="last_name"
                type="text"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Pontes"
              />
            </div>
          </div>

          {/* Username */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="username">Usuário *</Label>
            <Input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder="osman.pontes"
              required
              readOnly
              className="bg-gray-50 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500">
              Gerado automaticamente a partir do nome e sobrenome
            </p>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">E-mail corporativo *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="osman.pontes@email.com"
              required
            />
            <p className="text-xs text-gray-500">
              Use um e-mail dos nossos domínios corporativos
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Cargo */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="cargo">Cargo</Label>
              <Select
                id="cargo"
                name="cargo"
                value={formData.cargo}
                onChange={handleChange}
              >
                <option value="">Selecione um cargo</option>
                <option value="Advogado">Advogado</option>
                <option value="Analista">Analista</option>
                <option value="Gerente executivo">Gerente executivo</option>
                <option value="Assistente adm">Assistente adm</option>
                <option value="Estagiário">Estagiário</option>
                <option value="Fiscal">Fiscal</option>
                <option value="Jovem aprendiz">Jovem aprendiz</option>
                <option value="Supervisor">Supervisor</option>
                <option value="Auditor">Auditor</option>
                <option value="Coordenador">Coordenador</option>
                <option value="Operador">Operador</option>
                <option value="Executivo de vendas">Executivo de vendas</option>
                <option value="Gerente">Gerente</option>
                <option value="Diretor">Diretor</option>
                <option value="Auxiliar">Auxiliar</option>
              </Select>
            </div>

            {/* Setor */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="setor">Setor</Label>
              <Select
                id="setor"
                name="setor"
                value={formData.setor}
                onChange={handleChange}
              >
                <option value="">Selecione um setor</option>
                <option value="Marketing">Marketing</option>
                <option value="Comercial">Comercial</option>
                <option value="Auditoria">Auditoria</option>
                <option value="Recursos Humanos">Recursos Humanos</option>
                <option value="TI">TI</option>
                <option value="TD">TD</option>
                <option value="Contabilidade">Contabilidade</option>
                <option value="Outros">Outros</option>
              </Select>
            </div>
          </div>

          {/* Campo condicional para "Outros" setor */}
          {formData.setor === 'Outros' && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="setor_outros">Especifique o setor</Label>
              <Input
                id="setor_outros"
                name="setor_outros"
                type="text"
                value={setorOutros}
                onChange={handleSetorOutrosChange}
                placeholder="Digite o nome do setor"
              />
              <p className="text-xs text-gray-500">
              </p>
            </div>
          )}

          {/* Senha */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Senha *</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
            <p className="text-xs text-gray-500">Mínimo de 8 caracteres</p>
          </div>

          {/* Confirmar Senha */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="password_confirm">Confirmar Senha *</Label>
            <Input
              id="password_confirm"
              name="password_confirm"
              type="password"
              value={formData.password_confirm}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          {/* Botão de Cadastro */}
          <Button
            type="submit"
            size="lg"
            disabled={isLoading}
            className="w-full bg-primary text-dark hover:bg-primary/90 font-semibold mt-2"
          >
            {isLoading ? 'Cadastrando...' : 'Criar Conta'}
          </Button>
        </form>

        {/* Link para Login */}
        <div
          className="text-primary text-sm font-semibold text-center cursor-pointer hover:text-primary/80 transition-colors"
          onClick={handleBackToLogin}
        >
          ← Já tem conta? Faça login
        </div>
      </div>
    </div>
  );
}

export default Cadastro;
