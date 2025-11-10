WITH cto_agrupado AS (
    SELECT
        CTO.VERSAO,
        CTO.DATA,
        SUM(CTO.VALOR) AS CTO
    FROM MAPA_DO_BOSQUE."Rgm_cto" AS CTO
    WHERE 1 = 1
      AND CTO.DATA >= :data_inicio
      AND CTO.DATA <= :data_fim
      {filtros_cto}
    GROUP BY CTO.VERSAO, CTO.DATA
),
vendas_agrupadas AS (
    SELECT
        V.VERSAO,
        V.DATA,
        SUM(V.VALOR) AS VENDAS
    FROM MAPA_DO_BOSQUE."Rgm_valor_bruto" AS V
    WHERE 1 = 1
      AND V.DATA >= :data_inicio
      AND V.DATA <= :data_fim
      {filtros_vendas}
    GROUP BY V.VERSAO, V.DATA
)
SELECT
    C.DATA as data,
    CASE
        WHEN SUM(V.VENDAS) > 0 THEN (SUM(C.CTO) / SUM(V.VENDAS)) * 100
        ELSE 0
    END as valor
FROM cto_agrupado AS C
JOIN vendas_agrupadas AS V ON C.DATA = V.DATA AND C.VERSAO = V.VERSAO
GROUP BY C.DATA
ORDER BY C.DATA;
