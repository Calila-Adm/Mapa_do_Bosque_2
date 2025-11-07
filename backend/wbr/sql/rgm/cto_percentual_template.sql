-- Template SQL para CTO Percentual com JOIN entre Rgm_cto e Rgm_valor_bruto
-- Calcula o CTO como percentual da Venda Bruta
-- Lógica: Soma total do CTO do mês / Soma total do Valor Bruto do mês * 100
-- Placeholders serão substituídos dinamicamente:
--   {coluna_data} -> coluna de data (sempre "data")
--   Filtros dinâmicos (chave, shopping, etc) serão aplicados após as condições de data

WITH cto_data AS (
    SELECT
        CTO.chave,
        CTO.data,
        CTO.valor as cto_valor,
        VB.valor as venda_bruta
    FROM "mapa_do_bosque"."Rgm_cto" AS CTO
    JOIN "mapa_do_bosque"."Rgm_valor_bruto" AS VB
        ON CONCAT(CTO.chave, '-', CTO.data) = CONCAT(VB.chave, '-', VB.data)
    WHERE 1 = 1
      AND CTO.data >= :data_inicio
      AND CTO.data <= :data_fim
      {filtros_dinamicos}
)
SELECT
    data,
    CASE
        WHEN SUM(venda_bruta) > 0 THEN (SUM(cto_valor) / SUM(venda_bruta)) * 100
        ELSE 0
    END as valor
FROM cto_data
GROUP BY data
ORDER BY data;
