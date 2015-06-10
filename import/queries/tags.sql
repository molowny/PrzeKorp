select tags.id, tags.timecode_start, tags.timecode_end, tags.token_dom, tags.token_nondom, tiers.name as tier, types.id as type_id

from tags
  inner join tiers on tags.tier = tiers.id
  inner join transcripts on tiers.transcript = transcripts.id
  inner join movies on transcripts.movie = movies.id and movies.id = $1

  left join tokens on tags.token_dom = tokens.id OR tags.token_nondom = tokens.id
  left join types on tokens.type = types.id

ORDER BY tags.timecode_start
limit 500
