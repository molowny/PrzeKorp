SELECT tags.id, tags.timecode_start, tags.timecode_end, tags.token_dom, tags.token_nondom,
       tags.value, tiers.name as tier, types.id as type_id, movies.name as movie

FROM tags
  INNER JOIN tiers ON tags.tier = tiers.id
  INNER JOIN transcripts ON tiers.transcript = transcripts.id
  INNER JOIN movies on transcripts.movie = movies.id

  LEFT JOIN tokens ON tags.token_dom = tokens.id OR tags.token_nondom = tokens.id
  LEFT JOIN types ON tokens.type = types.id

ORDER BY tags.timecode_start
