-- Template SQL único e reutilizável para todos os gráficos WBR
-- Placeholders serão substituídos dinamicamente pelo QueryBuilder:
--   {coluna_data} -> coluna de data da tabela
--   {coluna_valor} -> coluna numérica/métrica da tabela
--   {tabela} -> nome da tabela
--   {filtros_dinamicos} -> cláusulas WHERE adicionais (região, status, etc)

SELECT
    {coluna_data} as data,
    SUM({coluna_valor}) as valor
FROM {tabela}
WHERE 1=1
    {filtros_dinamicos}
    AND {coluna_data} >= :data_inicio
    AND {coluna_data} <= :data_fim
GROUP BY {coluna_data}
ORDER BY {coluna_data};
