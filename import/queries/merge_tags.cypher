MATCH (n:Tag {movie: {name}}), (m:Tag {movie: {name}})
WHERE n <> m AND n.timecode_start = m.timecode_end
CREATE UNIQUE (n)-[:NEXT]->(m)
