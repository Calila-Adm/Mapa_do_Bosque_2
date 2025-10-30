-- Template SQL para métricas do Instagram (múltiplos schemas)
-- Placeholders serão substituídos dinamicamente pelo QueryBuilder:
--   {coluna_data} -> coluna de data (sempre "data" para Instagram)
--   {coluna_valor} -> coluna numérica/métrica (total_likes, total_alcance, etc)
--   {filtros_dinamicos} -> cláusulas WHERE adicionais (shopping, etc)

WITH all_data AS (
    -- SCIB
    SELECT
        'SCIB' as shopping,
        DATE(p."postedAt") as data,
        COALESCE(SUM(i.likes), 0) as total_likes,
        COALESCE(SUM(i.reach), 0) as total_alcance,
        COALESCE(SUM(i.impressions), 0) as total_impressoes,
        COALESCE(SUM(i.comments), 0) as total_comentarios,
        COALESCE(SUM(i.shares), 0) as total_compartilhamentos,
        COALESCE(SUM(i.saved), 0) as total_salvos,
        (COALESCE(SUM(i.likes), 0) + COALESCE(SUM(i.comments), 0) +
         COALESCE(SUM(i.shares), 0) + COALESCE(SUM(i.saved), 0)) as engajamento_total,
        COUNT(DISTINCT p.id) as total_posts
    FROM "instagram-data-fetch-scib"."Post" p
    LEFT JOIN "instagram-data-fetch-scib"."PostInsight" i ON p.id = i."postId"
    WHERE DATE(p."postedAt") >= :data_inicio
      AND DATE(p."postedAt") <= :data_fim
    GROUP BY DATE(p."postedAt")

    UNION ALL

    -- SBGP
    SELECT
        'SBGP' as shopping,
        DATE(p."postedAt") as data,
        COALESCE(SUM(i.likes), 0) as total_likes,
        COALESCE(SUM(i.reach), 0) as total_alcance,
        COALESCE(SUM(i.impressions), 0) as total_impressoes,
        COALESCE(SUM(i.comments), 0) as total_comentarios,
        COALESCE(SUM(i.shares), 0) as total_compartilhamentos,
        COALESCE(SUM(i.saved), 0) as total_salvos,
        (COALESCE(SUM(i.likes), 0) + COALESCE(SUM(i.comments), 0) +
         COALESCE(SUM(i.shares), 0) + COALESCE(SUM(i.saved), 0)) as engajamento_total,
        COUNT(DISTINCT p.id) as total_posts
    FROM "instagram-data-fetch-sbgp"."Post" p
    LEFT JOIN "instagram-data-fetch-sbgp"."PostInsight" i ON p.id = i."postId"
    WHERE DATE(p."postedAt") >= :data_inicio
      AND DATE(p."postedAt") <= :data_fim
    GROUP BY DATE(p."postedAt")

    UNION ALL

    -- SBI
    SELECT
        'SBI' as shopping,
        DATE(p."postedAt") as data,
        COALESCE(SUM(i.likes), 0) as total_likes,
        COALESCE(SUM(i.reach), 0) as total_alcance,
        COALESCE(SUM(i.impressions), 0) as total_impressoes,
        COALESCE(SUM(i.comments), 0) as total_comentarios,
        COALESCE(SUM(i.shares), 0) as total_compartilhamentos,
        COALESCE(SUM(i.saved), 0) as total_salvos,
        (COALESCE(SUM(i.likes), 0) + COALESCE(SUM(i.comments), 0) +
         COALESCE(SUM(i.shares), 0) + COALESCE(SUM(i.saved), 0)) as engajamento_total,
        COUNT(DISTINCT p.id) as total_posts
    FROM "instagram-data-fetch-sbi"."Post" p
    LEFT JOIN "instagram-data-fetch-sbi"."PostInsight" i ON p.id = i."postId"
    WHERE DATE(p."postedAt") >= :data_inicio
      AND DATE(p."postedAt") <= :data_fim
    GROUP BY DATE(p."postedAt")
)
SELECT
    {coluna_data} as data,
    SUM({coluna_valor}) as valor
FROM all_data
WHERE 1=1
    {filtros_dinamicos}
GROUP BY {coluna_data}
ORDER BY {coluna_data};
