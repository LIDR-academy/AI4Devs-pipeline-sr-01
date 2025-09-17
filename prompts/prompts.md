Prompt #|

**Rol que asumes:** Arquitecto/a DevSecOps senior con foco en seguridad,
confiabilidad y mantenibilidad.\
**Objetivo:** Diseñar e implementar un pipeline en **GitHub Actions**
que se **dispare únicamente al hacer push a una rama que tenga un Pull
Request abierto** y ejecute, en orden:\
1) tests de backend, 2) build de backend, 3) despliegue del backend en
**AWS EC2**.

**Repositorio & alcance:** Backend monolítico o service backend con test
suite existente (p. ej., `npm test`, `pytest`, `mvn test`, etc.). Si
faltan scripts, propondrás estándares.

**Restricciones no negociables (DevSecOps):** - Uso de **GitHub
Actions** en `.github/workflows/pipeline.yml`.\
- Disparo solo cuando haya **PR abierto** para la rama donde se hace
push.\
- Manejo de **secrets** vía GitHub Actions Secrets/Environments (sin
credenciales en repo).\
- Despliegue a **EC2** *idempotente*, con rollback sencillo (p. ej.,
mantener versión anterior).\
- Log y artefactos retenidos (min. 7 días).\
- Cache de dependencias para acelerar CI.\
- Matriz opcional por versiones de runtime si corresponde.\
- Política de mínima exposición de permisos (`permissions:`) en el
workflow.

------------------------------------------------------------------------

## 1) Entregable Fase 1 --- Plan de acción (para aprobación)

Propón un **plan de acción detallado** que incluya:

1.  **Arquitectura del pipeline (alto nivel)**
    -   Diagrama/flujo textual de jobs y dependencias.
    -   Eventos y filtro: push → verificación de PR abierto (usa
        `actions/github-script` o `gh api`).
    -   Environments (p. ej., `staging`): protección y secrets
        necesarios.
2.  **Estrategia de detección "push a rama con PR abierto"**
    -   Paso previo que consulte la API de GitHub para saber si
        `refs/heads/<branch>` tiene PR abierto.
    -   `if:` condicional a nivel *job* usando la salida del paso
        anterior.
3.  **Política de seguridad**
    -   `permissions:` mínimas por job.\
    -   Uso de `SSH` con **short-lived keys** o `SSM` (preferible) para
        EC2.\
    -   Validación de host (`known_hosts`) o session manager si se evita
        SSH.\
    -   Escaneo de secrets en cambios (opcional, si hay tooling).
4.  **Estrategia de tests**
    -   Comando exacto, cobertura mínima, reportes (JUnit/LCOV) y
        condiciones de fallo.
5.  **Estrategia de build**
    -   Comando exacto, artefactos empaquetados (p. ej., `.zip`/Docker
        image), checksum, retención.
6.  **Estrategia de despliegue en EC2**
    -   Método: SSH + rsync/scp o **AWS SSM** + script remoto
        (preferido).\
    -   Layout de deploy en instancia (`/opt/app/releases/<sha>`,
        symlink `current`, *pre/post hooks*).\
    -   Health check tras el *restart* (p. ej.,
        `curl http://localhost:PORT/health`).\
    -   Rollback: revertir symlink a `previous` si falla health check.
7.  **Observabilidad**
    -   Logs del deploy, artefactos de pipeline, anotaciones en PR
        (estado, cobertura).
8.  **Criterios de aceptación**
    -   Pipeline solo corre cuando la rama **tiene PR abierto**.\
    -   Tests pasan; si fallan, **no hay build ni deploy**.\
    -   Build reproducible y versionado por `GITHUB_SHA`.\
    -   EC2 queda sirviendo la nueva versión y hay rollback operativo.

> **Acción solicitada:** Entregar este plan en formato texto conciso
> (máx. \~1 página), con lista de secrets/variables requeridas y
> convenciones de nombres.

------------------------------------------------------------------------

## 2) Entregable Fase 2 --- Implementación por micro-tareas (una vez aprobado el plan)

Desglosa en micro-tareas, cada una con **definición de hecho (DoD)**:

### Micro-tarea A --- Esqueleto del workflow

-   Crear `.github/workflows/pipeline.yml` con `on: push` y *job*
    `detect_pr`.
-   Paso `github-script` que marque `has_open_pr=true|false`.\
-   **DoD:** archivo presente, CI sintácticamente válido.

### Micro-tarea B --- Condicional de ejecución

-   Añadir condición `if: needs.detect_pr.outputs.has_open_pr == 'true'`
    en los jobs resto.\
-   **DoD:** los jobs quedan bloqueados cuando no hay PR abierto.

### Micro-tarea C --- Job de Tests

-   Instalar dependencias + cache.\
-   Ejecutar tests; subir reporte como artefacto.\
-   **DoD:** falla si tests fallan; reporte accesible.

### Micro-tarea D --- Job de Build

-   Empaquetar artefacto (zip/docker)---elige según stack.\
-   Subir artefacto; guardar checksum.\
-   **DoD:** artefacto disponible y verificable.

### Micro-tarea E --- Job de Deploy a EC2

-   Obtener artefacto; conectar por **SSM** o **SSH** seguro.\
-   Subir y desplegar en `/opt/app/releases/<sha>`; actualizar
    `current`.\
-   Reiniciar servicio (systemd/PM2/Docker) + health check + rollback si
    falla.\
-   **DoD:** salida del job evidencia éxito y health OK.

### Micro-tarea F --- Permisos y seguridad

-   Definir `permissions:` mínimos por job.\
-   Configurar secrets en `Environments`.\
-   **DoD:** no hay *warnings* por permisos excesivos.

### Micro-tarea G --- Documentación

-   `README-PIPELINE.md` con: flujo, cómo corre, cómo depurar,
    rollback.\
-   **DoD:** doc revisada y enlazada desde el PR.

------------------------------------------------------------------------

## 3) Lista de **secrets/variables** necesarios (propuesta)

-   `AWS_REGION`\
-   **Si usas SSM (recomendado):** `AWS_ROLE_TO_ASSUME` (opcional),
    permisos `ssm:SendCommand`, `ec2:DescribeInstances`.\
-   **Si usas SSH:** `EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY` (private),
    `KNOWN_HOSTS`.\
-   `APP_PORT` (para health check)\
-   Cualquier var de build (p. ej., `NODE_ENV`, `JAVA_VERSION`, etc.).

------------------------------------------------------------------------

## 4) Sub-prompts específicos (para que generes cada paso del pipeline)

### 4.1 Prompt --- **Detección de PR abierto** (pre-job)

> **Rol:** Especialista GitHub Actions.\
> **Tarea:** En un job `detect_pr`, usa `actions/github-script@v7` para
> comprobar si la branch del push (`GITHUB_REF_NAME`) tiene un PR
> **abierto**. Exporta `has_open_pr` como output `"true"`/`"false"`. Si
> hay varios PR abiertos, basta con que exista ≥1.\
> **Criterios:**\
> - No usar acciones obsoletas.\
> - Manejar paginación si fuese necesario.\
> - El job **no** debe fallar si no hay PR; solo debe marcar `"false"`.\
> **Salida esperada:** Paso `github-script` con JS que llame
> `github.rest.pulls.list` filtrando `state:'open'`,
> `head: <owner>:<branch>`, y `core.setOutput('has_open_pr', ...)`.

### 4.2 Prompt --- **Tests de backend**

> **Rol:** Ingeniero/a CI con foco en calidad.\
> **Tarea:** Implementa el job `test` que:\
> 1) restaure cache de dependencias, 2) instale dependencias, 3) ejecute
> tests (`<comando_tests>`), 4) publique reporte (JUnit/coverage) como
> artefacto, 5) falle si los tests fallan.\
> **Criterios:**\
> - `runs-on: ubuntu-latest`.\
> - Usa `actions/cache@v4` y separa claves por OS, lockfile y hash del
> directorio de dependencias.\
> - Permisos mínimos: `contents: read`, `actions: read`, `checks: write`
> si anotas resultados.\
> **Salida esperada:** Pasos YAML con cache + instalación + comando de
> tests + upload-artifact.

### 4.3 Prompt --- **Build del backend**

> **Rol:** Ingeniero/a de build reproducible.\
> **Tarea:** Implementa el job `build` (depende de `test`) que genere un
> artefacto empaquetado con etiqueta `GITHUB_SHA`, más checksum.\
> **Criterios:**\
> - Usa cache donde aplique.\
> - Publica artefacto (`actions/upload-artifact@v4`) y checksum.\
> - No desplegar aquí; solo producir artefacto.\
> **Salida esperada:** Pasos YAML de build y empaquetado + upload del
> `.zip` o imagen (si es Docker, *push* opcional a un registry **solo
> si** hay credenciales configuradas).

### 4.4 Prompt --- **Despliegue a EC2**

> **Rol:** Especialista AWS DevOps.\
> **Tarea:** Implementa `deploy` (depende de `build`) que:\
> - Descargue artefacto,\
> - Se conecte a EC2 vía **SSM** (preferido) o **SSH** seguro,\
> - Suba y descomprima en `/opt/app/releases/$GITHUB_SHA`,\
> - Actualice symlink `/opt/app/current`,\
> - Reinicie servicio (systemd/PM2/Docker),\
> - Haga health check `http://localhost:${APP_PORT}/health`,\
> - Si falla, rollback a `previous` y marca el job como fallido.\
> **Criterios:**\
> - Usa `aws-actions/configure-aws-credentials@v4`.\
> - Si SSM: `aws ssm send-command` con script *inline* o doc de SSM.\
> - Si SSH: `scp`/`rsync` + `ssh` con `StrictHostKeyChecking=yes`.\
> **Salida esperada:** YAML del job de deploy con pasos claros y logs
> suficientes.