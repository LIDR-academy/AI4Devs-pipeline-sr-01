Each @slice has use cases that are determined by its input, use their corresponding @schema to generate use cases that should be described in the following format:

{
	"type": "object",
	"required": ["partitions", "boundaries", "scenarios", "negatives", "oracle_rules", "assumptions"],
	"properties": {
		"partitions": { "type": "array", "items": { "type": "string" }},
		"boundaries": { "type": "array", "items": { "type": "string" }},
		"scenarios": { "type": "array", "items": { "type": "string" }},
		"negatives": { "type": "array", "items": { "type": "string" }},
		"oracle_rules": { "type": "array", "items": { "type": "string" }},
		"assumptions": { "type": "array", "items": { "type": "string" }}
	},
	"additionalProperties": false
}	   