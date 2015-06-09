MATCH (glosa:Glosa { id: {type_id} })
CREATE (tag:Tag { id: {id}, movie: {movie}, timecode_start: {timecode_start}, timecode_end: {timecode_end} })
MERGE (tag)-[:SHOWS{ hand: {hand} }]->(glosa)