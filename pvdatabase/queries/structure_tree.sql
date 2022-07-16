WITH StructureTree (parent, child, c_description, level) AS
(
	SELECT 
		father_code AS parent, 
		structure_code AS child, 
		description as c_description, 
		0 AS [level]
	FROM ip.structure
	WHERE father_code is null

	UNION ALL

	SELECT 
		s.father_code as parent, 
		s.structure_code as child, 
		s.description as c_description, 
		[level] + 1
	FROM ip.structure AS s
	INNER JOIN StructureTree AS ST
		ON s.father_code = ST.child
)

SELECT parent, child, c_description, [level] from StructureTree order by level;