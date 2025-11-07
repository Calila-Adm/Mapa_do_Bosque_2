-- Template SQL para métricas do Instagram (múltiplos schemas)
-- Placeholders serão substituídos dinamicamente pelo QueryBuilder:
--   {coluna_data} -> coluna de data (sempre "data" para Instagram)
--   {coluna_valor} -> coluna numérica/métrica (total_likes, total_alcance, etc)
--   Filtros dinâmicos (shopping, etc) serão aplicados no WHERE final

WITH POSTINSIGHT AS (
    SELECT
        I.*
    FROM (
        SELECT
            'SCIB' AS SHOPPING,
            *,
            ROW_NUMBER() OVER(PARTITION BY "postId" ORDER BY "measuredAt" DESC) AS ORDEM
        FROM "instagram-data-fetch-scib"."PostInsight"

        UNION ALL

        SELECT
            'SBGP' AS SHOPPING,
            *,
            ROW_NUMBER() OVER(PARTITION BY "postId" ORDER BY "measuredAt" DESC) AS ORDEM
        FROM "instagram-data-fetch-sbgp"."PostInsight"

        UNION ALL

        SELECT
            'SBI' AS SHOPPING,
            *,
            ROW_NUMBER() OVER(PARTITION BY "postId" ORDER BY "measuredAt" DESC) AS ORDEM
        FROM "instagram-data-fetch-sbi"."PostInsight"
    ) AS I
    WHERE I.ORDEM = 1
),
POST AS (
    SELECT
        'SCIB' AS SHOPPING,
        "id" AS ID,
        "postedAt" AS DATA_POST
    FROM "instagram-data-fetch-scib"."Post"

    UNION ALL

    SELECT
        'SBGP' AS SHOPPING,
        "id" AS ID,
        "postedAt" AS DATA_POST
    FROM "instagram-data-fetch-sbgp"."Post"

    UNION ALL

    SELECT
        'SBI' AS SHOPPING,
        "id" AS ID,
        "postedAt" AS DATA_POST
    FROM "instagram-data-fetch-sbi"."Post"
),
all_data AS (
    SELECT
        P.SHOPPING as shopping,
        DATE(P.DATA_POST) as data,
        COALESCE(SUM(I.likes), 0) as total_likes,
        COALESCE(SUM(I.reach), 0) as total_alcance,
        COALESCE(SUM(I.impressions), 0) as total_impressoes,
        COALESCE(SUM(I.comments), 0) as total_comentarios,
        COALESCE(SUM(I.shares), 0) as total_compartilhamentos,
        COALESCE(SUM(I.saved), 0) as total_salvos,
        (COALESCE(SUM(I.likes), 0) + COALESCE(SUM(I.comments), 0) +
         COALESCE(SUM(I.shares), 0) + COALESCE(SUM(I.saved), 0)) as engajamento_total,
        COUNT(DISTINCT P.ID) as total_posts
    FROM POST AS P
    JOIN POSTINSIGHT AS I ON CONCAT(P.SHOPPING, '-', P.ID) = CONCAT(I.SHOPPING, '-', I."postId")
    WHERE DATE(P.DATA_POST) >= :data_inicio
      AND DATE(P.DATA_POST) <= :data_fim
    GROUP BY P.SHOPPING, DATE(P.DATA_POST)
)
SELECT
    {coluna_data} as data,
    SUM({coluna_valor}) as valor
FROM all_data
WHERE 1=1
    {filtros_dinamicos}
GROUP BY {coluna_data}
ORDER BY {coluna_data};
