## Prompts 1 ##
Eres un DevOps Engineer.
Debes crear el archivo .github/workflows/ci.yml para este proyecto backend.

Contexto del pipeline
	•	Se ejecuta con el evento pull_request (opened).
	•	Flujo:
	1.	Ejecutar tests (npm ci, npm test).
	2.	Generar el build (npm run build).
	3.	Desplegar el build en una instancia AWS EC2.

Requisitos técnicos
	•	Usa Node.js como stack por defecto.
	•	Usa artefactos para pasar el build al job de deploy.
	•	El deploy se hace por SSH/SCP a la EC2 usando secrets:
	•	AWS_ACCESS_ID, AWS_ACCESS_KEY, EC2_INSTANCE
	•	Reinicia un servicio en EC2 llamado backend.service.
	•	Incluye comentarios breves en el YAML para que sea entendible.

Entregable
	•	Devuelve únicamente el contenido de .github/workflows/ci.yml en un bloque de código YAML.
	•	No escribas explicación adicional fuera del YAML.

## Prompts 2 ##
   crea un scrip o verifica que todo este correcto para subir el cambio