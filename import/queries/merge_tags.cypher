MATCH (n:Tag), (m:Tag)
WHERE n <> m AND n.timecode_start = m.timecode_end AND n.movie = m.movie
CREATE (n)-[:NEXT]->(m)
