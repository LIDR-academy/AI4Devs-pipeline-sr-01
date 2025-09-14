# Prompts para Pipeline CI/CD

## Prompt Principal para el Pipeline Completo

**Prompt utilizado:**
```
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
```

## Prompt para Tests de Backend

**Prompt utilizado:**
```
Crea un job de GitHub Actions para ejecutar tests de backend con las siguientes características:
- Proyecto Node.js con TypeScript
- Usa Jest como framework de testing
- Base de datos PostgreSQL con Prisma ORM
- Necesita servicio de PostgreSQL en el runner
- Configurar variables de entorno para la base de datos de test
- Ejecutar migraciones de Prisma antes de los tests
- Generar cliente de Prisma antes de ejecutar tests
- Usar cache de npm para optimizar el tiempo de build
```

**Resultado:** Job `test` que configura PostgreSQL como servicio, instala dependencias, ejecuta migraciones y tests.

## Prompt para Generación del Build

**Prompt utilizado:**
```
Crea un job de GitHub Actions para generar el build del backend con:
- Dependencias de Node.js con TypeScript
- Script de build: "tsc" (TypeScript compiler)
- Generar cliente de Prisma para producción
- Subir artifacts del build para uso posterior
- Dependencia del job de tests (solo ejecutar si tests pasan)
- Cache de npm para optimización
```

**Resultado:** Job `build` que compila TypeScript, genera Prisma client y sube artifacts.

## Prompt para Despliegue en EC2

**Prompt utilizado:**
```
Crea un job de GitHub Actions para desplegar en AWS EC2 con:
- Trigger solo en push a ramas main/develop
- Usar easingthemes/ssh-deploy para transferir archivos
- Usar appleboy/ssh-action para ejecutar comandos remotos
- Instalar dependencias de producción en EC2
- Ejecutar migraciones de Prisma en producción
- Usar PM2 para gestionar el proceso de la aplicación
- Incluir health check para verificar que la aplicación funciona
- Configurar variables de entorno como secrets de GitHub
```

**Resultado:** Job `deploy` que transfiere archivos, instala dependencias, ejecuta migraciones y gestiona el proceso con PM2.

## Prompt para Optimizaciones del Pipeline

**Prompt utilizado:**
```
Continua por ahora sin los secrets. Necesito optimizar el pipeline con:
- Agregar endpoint de health check en el backend
- Crear configuración de PM2 para gestión de procesos
- Crear script de despliegue automatizado
- Mejorar el logging y verificación del despliegue
- Corregir el puerto de la aplicación (3010)
```

**Resultado:** 
- Endpoint `/health` agregado en `backend/src/index.ts`
- Archivo `backend/ecosystem.config.js` para configuración de PM2
- Script `backend/deploy.sh` para automatización del despliegue
- Pipeline optimizado con mejor verificación y logging

## Prompts Específicos para Archivos Creados

### Prompt para Endpoint de Health Check

**Prompt utilizado:**
```
Agrega un endpoint de health check al backend en backend/src/index.ts que:
- Responda en la ruta /health
- Retorne status 200 con información de estado
- Incluya timestamp y uptime del proceso
- Sea útil para monitoreo y CI/CD
```

### Prompt para Configuración de PM2

**Prompt utilizado:**
```
Crea un archivo de configuración ecosystem.config.js para PM2 que:
- Configure la aplicación backend
- Maneje diferentes entornos (desarrollo/producción)
- Configure autorestart y límites de memoria
- Use el puerto correcto (3010)
```

### Prompt para Script de Despliegue

**Prompt utilizado:**
```
Crea un script de despliegue deploy.sh que:
- Instale dependencias de producción
- Genere cliente de Prisma
- Ejecute migraciones de base de datos
- Gestiones el proceso con PM2
- Incluya logging detallado y manejo de errores
- Verifique el estado de la aplicación
```

## Configuración de Secrets Requeridos

Para que el pipeline funcione, necesitas configurar estos secrets en GitHub:

1. **EC2_SSH_KEY**: Clave privada SSH (.pem) para conectarse a la instancia EC2
2. **EC2_HOST**: DNS público o IP de la instancia EC2
3. **EC2_USER**: Usuario de la instancia (generalmente 'ubuntu')
4. **EC2_TARGET_DIR**: Directorio donde desplegar la aplicación (ej: '/home/ubuntu/app')

## Configuración Adicional Requerida

### En la instancia EC2:
1. Instalar Node.js 18+
2. Instalar PM2: `npm install -g pm2`
3. Configurar variables de entorno para la base de datos de producción
4. Configurar firewall para permitir tráfico en el puerto de la aplicación

### Variables de entorno necesarias:
- `DATABASE_URL`: URL de conexión a PostgreSQL de producción
- `PORT`: Puerto donde correrá la aplicación (opcional, default 3000)
- Otras variables específicas de tu aplicación

## Resumen de Prompts Utilizados

### 1. Prompt Principal
- **Objetivo**: Crear pipeline completo de CI/CD para AWS EC2
- **Enfoque**: DevOps especializado en AWS con referencia a documentación específica
- **Resultado**: Pipeline base con 3 jobs (test, build, deploy)

### 2. Prompt para Tests
- **Objetivo**: Configurar testing automatizado con PostgreSQL
- **Enfoque**: Jest + Prisma + PostgreSQL en GitHub Actions
- **Resultado**: Job de testing con base de datos de prueba

### 3. Prompt para Build
- **Objetivo**: Compilación y preparación para producción
- **Enfoque**: TypeScript compilation + artifacts management
- **Resultado**: Job de build con artifacts para despliegue

### 4. Prompt para Deploy
- **Objetivo**: Despliegue automatizado en EC2
- **Enfoque**: SSH + PM2 + health checks
- **Resultado**: Job de despliegue con verificación completa

### 5. Prompt para Optimizaciones
- **Objetivo**: Mejorar robustez y mantenibilidad
- **Enfoque**: Health checks + PM2 config + deploy scripts
- **Resultado**: Pipeline optimizado con mejor logging y verificación

## Referencias

- [Deploy to AWS EC2 using GitHub Actions](https://lightrains.com/blogs/deploy-aws-ec2-using-github-actions/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Prisma Documentation](https://www.prisma.io/docs/)
