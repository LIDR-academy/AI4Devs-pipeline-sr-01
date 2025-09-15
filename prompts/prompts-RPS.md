# Prompts (Github Copilot - Claudia 4 Sonnet)

## Prompt inicial

Eres un experto de DevOps y CI/CD, espeializado en despliegue de aplicaciones en AWS utilizando un servidor EC2 con Ubuntu.

Quiero que me ayudes a confirgurar mi pipeline.yml para realizar el despliegue de mi aplicación en mi servidor EC2. Debes primero entender bien como funciona todo el sistema, así como como instalar sus dependencias y comandos para su ejecución, lo cual puedes encontrar en el archivo README.md.

Para realizar la integración, puedes utilizar esta guía como referencia: https://medium.com/@mogbonjubolag/ci-cd-simplified-deploying-a-full-stack-app-to-aws-ec2-using-github-actions-5e4b5508ff1b

Tu misión en este ejercicio es crear un pipeline en GitHub Actions que, tras el trigger "push a una rama con un Pull Request abierto", siga los siguientes pasos:

- Pase unos tests de backend. 
- Genere un build del backend.
- Despliegue el backend en un EC2.

Asegúrate de que el pipeline se dispare con un push a una rama con un Pull Request abierto. El pipeline debería parar y no realizar la build y despliegue sin los tests fallan.

Quiero que generes el pipeline con los 3 jobs bien diferenciados y dependientes el uno del otro para que no se ejecuten si el anterior falla.

## Prompt final utilizado tras iteración con meta-prompting

Eres un experto en DevOps y CI/CD, especializado en despliegue de aplicaciones en AWS utilizando un servidor EC2 con Ubuntu.

Tu misión es ayudarme a configurar un archivo pipeline.yml para GitHub Actions que realice el despliegue automático de mi aplicación en un servidor EC2.

Antes de generar el pipeline, debes:

Comprender bien cómo funciona la aplicación, incluyendo sus dependencias, instalación y comandos de ejecución (esta información está disponible en el archivo README.md).

Tomar como referencia esta guía de integración:
👉 https://medium.com/@mogbonjubolag/ci-cd-simplified-deploying-a-full-stack-app-to-aws-ec2-using-github-actions-5e4b5508ff1b

Requisitos del pipeline

El trigger debe activarse cuando haya un push a una rama que tenga un Pull Request abierto.

El pipeline debe tener 3 jobs separados y dependientes, de forma que cada job solo se ejecute si el anterior fue exitoso:

Tests: ejecutar los tests del backend.

Build: generar el build del backend (solo si los tests pasan).

Deploy: desplegar el backend en el servidor EC2 (solo si el build fue exitoso).

El pipeline debe detenerse inmediatamente si los tests fallan, sin continuar con las siguientes fases.

Entregable

Genera el archivo pipeline.yml completo y bien estructurado, siguiendo las mejores prácticas de CI/CD en GitHub Actions, asegurándote de:

Definir correctamente el trigger.

Incluir los 3 jobs con dependencias explícitas (needs).

Usar pasos claros y comentados para cada fase (tests, build, deploy).

Incorporar seguridad básica (por ejemplo, uso de secrets de GitHub para credenciales y claves SSH).
