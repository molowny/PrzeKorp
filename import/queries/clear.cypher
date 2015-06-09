MATCH (n:Tag)
OPTIONAL MATCH (n)-[r]-()
DELETE n,r