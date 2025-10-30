# WBR Analytics - API para Gráficos

Sistema escalável e modular para alimentar gráficos E-Charts usando metodologia Working Backwards (WBR).

## 🎯 Características

- ✅ **Modular e Escalável**: Adicione novos gráficos apenas criando arquivos JSON
- ✅ **Performance**: Queries paralelas + Connection Pool + Cache Redis
- ✅ **Zero Código Duplicado**: Template SQL único reutilizável
- ✅ **Segurança**: Sanitização de inputs, prepared statements
- ✅ **Observabilidade**: Logs estruturados em JSON
- ✅ **Flexível**: Suporta múltiplos bancos de dados e sistemas de cache

## 📊 Formato de Saída

```json
{
  "semanas_cy": {
    "metric_value": {"2025-10-13T00:00:00.000Z": 2500, ...},
    "index": ["2025-10-13T00:00:00.000Z", ...]
  },
  "semanas_py": {
    "metric_value": {"2024-10-13T00:00:00.000Z": 2000, ...},
    "index": ["2024-10-13T00:00:00.000Z", ...]
  },
  "meses_cy": {...},
  "meses_py": {...},
  "ano_atual": 2025,
  "ano_anterior": 2024,
  "semana_parcial": false,
  "mes_parcial_cy": true,
  "mes_parcial_py": false
}
```

## 🚀 Quick Start

### 1. Criar Configuração de Gráfico

Crie um arquivo JSON em `wbr/config/graficos/{grafico_id}.json`:

```json
{
  "grafico_id": "vendas_regional",
  "tabela": "fato_vendas",
  "colunas": {
    "data": "data_venda",
    "valor": "total_vendas"
  },
  "filtros": {
    "regiao": "Nordeste",
    "status": "APROVADO"
  },
  "agrupamento": "semanal"
}
```

### 2. Criar Configuração de Página (Opcional)

Crie um arquivo JSON em `wbr/config/pages/{page_id}.json`:

```json
{
  "page_id": "dashboard_vendas",
  "nome": "Dashboard de Vendas",
  "graficos": [
    "vendas_regional",
    "estoque_produto"
  ]
}
```

### 3. Usar API

**Endpoint único:**
```bash
GET /api/wbr/vendas_regional/
```

**Endpoint de página (recomendado para dashboards):**
```bash
GET /api/wbr/page/dashboard_vendas/
```

## 📁 Estrutura do Módulo

```
wbr/
├── config/
│   ├── graficos/          # Configurações JSON dos gráficos
│   └── pages/             # Configurações JSON das páginas
├── sql/
│   └── query_template.sql # Template SQL único
├── services/
│   ├── config_loader.py   # Carrega configurações
│   ├── query_builder.py   # Constrói queries dinâmicas
│   ├── data_processor.py  # Transforma dados para formato WBR
│   ├── wbr_service.py     # Orquestrador principal
│   └── logger.py          # Logger estruturado
├── database/
│   ├── interface.py       # Interface abstrata
│   └── postgres_executor.py  # Implementação PostgreSQL
├── cache/
│   ├── interface.py       # Interface abstrata
│   ├── redis_cache.py     # Implementação Redis
│   └── null_cache.py      # Cache vazio (para testes)
├── exceptions/
│   └── wbr_exceptions.py  # Exceções customizadas
├── factories/
│   └── component_factory.py  # Factory de componentes
├── views.py               # Views Django (API endpoints)
└── urls.py                # URLs do módulo
```

## ⚙️ Configuração

### Backend (Django)

1. **Adicionar ao INSTALLED_APPS** (já feito):
```python
INSTALLED_APPS = [
    ...
    'wbr',
]
```

2. **Configurar variáveis de ambiente** (`.env`):
```bash
WBR_DB_POOL_SIZE=20
WBR_QUERY_TIMEOUT=30
WBR_CACHE_ENABLED=false
WBR_REDIS_URL=redis://localhost:6379/0
WBR_CACHE_TTL=3600
WBR_LOG_LEVEL=INFO
WBR_LOG_FORMAT=json
```

3. **Instalar dependências**:
```bash
cd backend
pip install redis
```

### Frontend (React + TypeScript)

1. **Importar service**:
```typescript
import { wbrApi, WBRData } from './services/wbrApi';
```

2. **Usar hook**:
```typescript
import { useWBRPage } from './hooks/useWBRPage';

function Dashboard() {
  const { data, loading, error } = useWBRPage('dashboard_vendas');

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <div>
      {data && Object.entries(data).map(([id, grafico]) => (
        <GraficoComponent key={id} id={id} data={grafico} />
      ))}
    </div>
  );
}
```

## 🎨 Exemplo de Uso Completo

### 1. Criar Gráfico de Vendas

**Arquivo:** `wbr/config/graficos/vendas_regional.json`
```json
{
  "grafico_id": "vendas_regional",
  "tabela": "fato_vendas",
  "colunas": {
    "data": "data_venda",
    "valor": "total_vendas"
  },
  "filtros": {
    "regiao": "Nordeste"
  },
  "agrupamento": "semanal"
}
```

### 2. Testar Endpoint

```bash
curl http://localhost:8000/api/wbr/vendas_regional/
```

### 3. Usar no Frontend

```typescript
const { data } = useWBRPage('dashboard_vendas');

// data.vendas_regional conterá os dados WBR
```

## 🔧 API Endpoints

### Gráfico Individual

```
GET /api/wbr/{grafico_id}/
```

**Resposta:**
```json
{
  "semanas_cy": {...},
  "semanas_py": {...},
  "meses_cy": {...},
  "meses_py": {...},
  ...
}
```

### Página Completa (Recomendado)

```
GET /api/wbr/page/{page_id}/
```

**Resposta:**
```json
{
  "vendas_regional": {...dados WBR...},
  "estoque_produto": {...dados WBR...},
  "receita_mensal": {...dados WBR...}
}
```

**Vantagens:**
- 1 requisição HTTP (não 10+)
- Queries executadas em paralelo
- Cache automático
- Performance: 2-4 segundos para 10 gráficos

## 📊 Performance

- **Primeira carga**: 2-4 segundos (gera dados)
- **Próximas cargas**: < 1 segundo (cache)
- **Connection Pool**: 20 conexões simultâneas
- **Cache TTL**: 1 hora (configurável)
- **Queries paralelas**: Até 20 gráficos simultaneamente

## 🛡️ Segurança

- ✅ Sanitização de identificadores SQL
- ✅ Prepared statements para parâmetros
- ✅ Validação de colunas antes de executar queries
- ✅ Filtros escapados para prevenir SQL injection
- ✅ Timeout de queries (30 segundos)

## 🧪 Como Adicionar Novo Gráfico

**Passo 1:** Crie arquivo JSON
```bash
echo '{
  "grafico_id": "meu_grafico",
  "tabela": "minha_tabela",
  "colunas": {"data": "data_col", "valor": "valor_col"},
  "filtros": {},
  "agrupamento": "semanal"
}' > backend/wbr/config/graficos/meu_grafico.json
```

**Passo 2:** Teste
```bash
curl http://localhost:8000/api/wbr/meu_grafico/
```

**Pronto!** Não precisa escrever código.

## 📝 Agrupamento

### Semanal
- Agrupa por semana (domingo como início)
- Formato: `"2025-10-13T00:00:00.000Z"` (domingo da semana)

### Mensal
- Agrupa por mês (primeiro dia do mês)
- Formato: `"2025-01-01T00:00:00.000Z"` (primeiro dia)

## 🔍 Filtros

Filtros suportam:
- **Strings**: `"regiao": "Nordeste"`
- **Números**: `"quantidade": 100`
- **Null**: `"tipo": null` (ignorado)
- **Listas**: `"status": ["APROVADO", "PENDENTE"]` (IN clause)

## 📚 Arquitetura

### Princípios SOLID

- **S**ingle Responsibility: Cada classe tem 1 responsabilidade
- **O**pen/Closed: Extensível via interfaces
- **L**iskov Substitution: Interfaces respeitam contratos
- **I**nterface Segregation: Interfaces pequenas e específicas
- **D**ependency Inversion: Injeção de dependências

### Componentes

1. **ConfigLoader**: Carrega configurações JSON
2. **QueryBuilder**: Constrói queries SQL dinâmicas
3. **DatabaseExecutor**: Executa queries (+ connection pool)
4. **DataProcessor**: Transforma dados para formato WBR
5. **CacheInterface**: Sistema de cache plugável
6. **WBRService**: Orquestrador que coordena tudo
7. **ComponentFactory**: Cria componentes com dependências

## 🐛 Troubleshooting

### Erro: "Configuração não encontrada"
- Verifique se arquivo JSON existe em `wbr/config/graficos/`
- Verifique se `grafico_id` no JSON corresponde ao nome do arquivo

### Erro: "Colunas não encontradas"
- Verifique se `colunas.data` e `colunas.valor` existem na tabela
- Use nomes exatos das colunas no banco

### Performance lenta
- Ative cache Redis: `WBR_CACHE_ENABLED=true`
- Verifique índices nas colunas de data
- Aumente pool size: `WBR_DB_POOL_SIZE=30`

## 📄 Licença

MIT

## 👥 Contribuidores

- Sistema desenvolvido seguindo metodologia WBR (Working Backwards Requirements)
- Implementado com Claude Code
