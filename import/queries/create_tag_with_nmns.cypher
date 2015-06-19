MATCH (nmns:Nmns { type: {tier} })
MERGE (tag:Tag { movie: {movie}, timecode_start: {timecode_start}, timecode_end: {timecode_end} })
MERGE (tag)-[:SHOWS{ value: {value} }]->(nmns)
