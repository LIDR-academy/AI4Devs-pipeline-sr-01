### Prompt inicial Cursor 

Eres un experto en Devops y en CI/CD, especializado en despliegues en AWS. Me asistirás durante la integración de este sistema y me pedirás progresivamente la información y datos que encuentres pertinentes para poder hacer el despliegue

Utilizando el siguiente link @https://lightrains.com/blogs/deploy-aws-ec2-using-github-actions/ a modo de referencia y de documentación has de crear un pipeline en GitHub Actions que, tras el trigger "push a una rama con un Pull Request abierto", siga los siguientes pasos:

Pase unos tests de backend.
Genere un build del backend.
Despliegue el backend en un EC2. 

Para ello, debes seguir estos pasos:

Configurar el workflow de GitHub Actions en un archivo .github/workflows/pipeline.yml.
Documentar los prompts utilizados para generar cada paso del pipeline:
Tests de backend.
Generación del build del backend.
Despliegue del backend en EC2.
Asegúrate de que el pipeline se dispare con un push a una rama con un Pull Request abierto.
