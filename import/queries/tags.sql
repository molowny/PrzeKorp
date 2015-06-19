select tags.id, tags.timecode_start, tags.timecode_end, tags.token_dom, tags.token_nondom, tags.value, tiers.name as tier, types.id as type_id, movies.name as movie

from tags
  inner join tiers on tags.tier = tiers.id
  inner join transcripts on tiers.transcript = transcripts.id
  inner join movies on transcripts.movie = movies.id

  left join tokens on tags.token_dom = tokens.id OR tags.token_nondom = tokens.id
  left join types on tokens.type = types.id

where movies.name IN('K03AF01-21', 'K03AF22-26', 'K04BF01-14', 'K04BF14-26', 'K05BF01-12', 'K05BF13-26', 'K06BF01-13', 'K06BF14-26', 'K07AF01-12', 'K07AF13-26', 'K08BF01-16', 'K08BF17-26', 'K09BF01-15', 'K09BF16-26', 'K10BF01-14', 'K10BF15-26', 'K18BF01-13', 'K18BF14-26', 'K20AF01-14', 'K20AF15-26')

ORDER BY tags.timecode_start
limit 100000
