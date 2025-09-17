# AGENTS.md

Este archivo guía a agentes de código (y a personas) para crear, mantener y evolucionar un *pipeline* de **GitHub Actions** en este repositorio, siguiendo la **documentación oficial de GitHub**. Mantén este archivo corto, claro y accionable.

---

## Objetivo
Implementar y mantener un flujo de trabajo CI/CD en `.github/workflows/ci.yml` que compile, pruebe y verifique el proyecto en *pull requests* y ramas principales, usando únicamente prácticas y sintaxis soportadas oficialmente por GitHub Actions.

## Fuente de verdad
- Conceptos y funcionamiento de GitHub Actions: *"Entender GitHub Actions"* (docs oficiales).
- Guía rápida para crear el primer flujo: *Quickstart (docs oficiales)*.
- Sintaxis del flujo de trabajo YAML: *Workflow syntax (docs oficiales)*.

> Si hay conflicto entre cualquier guía y la documentación oficial, **gana la documentación oficial**.

## Definiciones mínimas (del glosario oficial)
- **Workflow**: proceso automatizado definido en YAML dentro de `.github/workflows/*.yml`.
- **Job**: conjunto de pasos que se ejecutan en el mismo *runner*.
- **Step**: unidad atómica (ejecuta una acción o un comando de *shell*).
- **Action**: reutilizable; publicada (pública o privada) o en el repo.
- **Runner**: máquina que ejecuta jobs (por ejemplo `ubuntu-latest`).

## Reglas para el agente
1. **Compatibilidad**: usar sintaxis soportada estable (evitar features en *beta* salvo que se pidan).
2. **Determinismo**: fijar versiones de *actions* (`@v4`, `@v3`, etc.) y de herramientas (por ejemplo Node 20).
3. **Seguridad**: nunca exponer secretos en logs. Usar `${{ secrets.* }}` y `permissions:` mínimos necesarios.
4. **Rendimiento**: habilitar cachés cuando aplique (por ejemplo `actions/setup-node` con `cache: npm`).
5. **Observabilidad**: emitir artefactos relevantes (coverage, build) y usar *concurrency* para evitar *runs* obsoletos.
6. **Portabilidad**: no depender de rutas o herramientas específicas del runner salvo necesidad.
7. **Tiempo de ejecución**: preferir `ubuntu-latest` salvo requerimiento específico.
8. **Triggers**: ejecutar en `pull_request` y `push` a `main`/`develop` (ajusta ramas si tu repo usa otras convenciones).
9. **Matrices**: si el proyecto es librería, probar varias versiones de lenguaje/OS cuando tenga sentido.
10. **Reutilización**: si el repo crece, considerar *reusable workflows*.

## Estructura de archivos
```
.github/
└─ workflows/
   └─ ci.yml      # flujo de CI principal (crear/actualizar con la plantilla de abajo)
```

## Plantilla recomendada de `ci.yml`
> **Toma de decisiones**: esta plantilla es conservadora, rápida y segura para la mayoría de proyectos.

```yaml
name: CI

on:
  push:
    branches: ["main", "develop"]
  pull_request:
    branches: ["main", "develop"]
  workflow_dispatch:

permissions:
  contents: read
  # Añade otros permisos mínimos cuando sea necesario (por ejemplo, para gh-pages)

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    timeout-minutes: 20

    strategy:
      fail-fast: false
      matrix:
        node: [20]

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node ${{ matrix.node }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
          cache: npm

      - name: Install deps
        run: npm ci

      - name: Lint
        run: npm run lint --if-present

      - name: Test
        run: npm test -- --ci --reporters=default --reporters=jest-junit
        env:
          CI: true

      - name: Build
        run: npm run build --if-present

      - name: Upload coverage (si aplica)
        if: success() && hashFiles('coverage/**') != ''
        uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: coverage

  # Ejemplo opcional: checks de formato en paralelo
  formatting:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - name: Prettier check
        run: npx prettier -c .
```

> **Sustituye** comandos por los propios de tu *stack* (por ejemplo, `pnpm`, `yarn`, `python`, `go`, `java`, etc.).

## Variantes por *stack* (rápidas)
- **Node con pnpm**: sustituye `npm ci` por `pnpm install --frozen-lockfile` y `cache: pnpm` en `setup-node`.
- **Python**: usa `actions/setup-python@v5`, crea y activa venv, instala con `pip`, cachea `pip` si aplica, ejecuta `pytest`.
- **Java**: `actions/setup-java@v4` con `distribution: temurin`, `cache: gradle` o `maven`.
- **Go**: `actions/setup-go@v5` y `go test ./...`.

## Secretos y configuración
- Define secretos en *Settings → Secrets and variables → Actions*. Referéncialos como `${{ secrets.MI_SECRETO }}`.
- Usa `env:` a nivel de *job* o *step* para variables no sensibles.

## Buenas prácticas adicionales
- Añade una *badge* al README: `![CI](https://github.com/OWNER/REPO/actions/workflows/ci.yml/badge.svg)`.
- Usa *paths-ignore* si hay archivos que no deben disparar CI.
- Divide *jobs* si necesitas paralelizar *lint*, *test*, *build*.
- Publica artefactos relevantes para facilitar la revisión.

## Checklist al abrir PRs
- [ ] La *badge* de CI aparece verde en el PR.
- [ ] Los artefactos (logs, coverage, build) son accesibles.
- [ ] No se han filtrado secretos.
- [ ] El tiempo de ejecución es razonable (< 10–15 min para proyectos estándar).

## Extensiones futuras
- *Reusable workflows* para repos múltiples.
- *CodeQL* para análisis estático de seguridad.
- Despliegue a ambientes (por ejemplo, GitHub Pages, Cloud, contenedores) con permisos mínimos.

## Cómo ejecutar localmente (opcional)
- Usa `act` (si está permitido) para probar *workflows* de forma local.

## Mantenimiento
- Revisa anualmente las versiones de *actions* y del runtime (`ubuntu-latest`, Node, etc.).
- Al detectar *deprecations* en logs, actualiza este archivo y `ci.yml`.

---

### Apéndice A · Snippets útiles
**Ignorar rutas comunes**
```yaml
on:
  push:
    branches: ["main"]
    paths-ignore:
      - "**.md"
      - "docs/**"
```

**Reutilizar caché de pip** (Python)
```yaml
- uses: actions/setup-python@v5
  with:
    python-version: '3.12'
    cache: 'pip'
- run: pip install -r requirements.txt
```

**Permissions mínimos para subir artefactos**
```yaml
permissions:
  contents: read
```

---

## Pipeline DevSecOps (Adicional)

Este repositorio incluye un pipeline avanzado en `.github/workflows/pipeline.yml` que:

- **Se ejecuta solo cuando hay PR abierto** para la rama
- **Ejecuta tests, build y deploy a EC2** en secuencia
- **Incluye rollback automático** si falla el health check
- **Usa AWS SSM** para despliegue seguro

### Documentación del Pipeline
- `README-PIPELINE.md` - Documentación técnica completa
- `.github/SETUP-PIPELINE.md` - Guía de configuración paso a paso

### Configuración Requerida
- GitHub Secrets: AWS credentials, EC2 instance ID, S3 bucket
- EC2 Setup: Node.js 20, PM2, AWS CLI, IAM role
- S3 Bucket: Para almacenar artefactos de deploy

---

> **Nota**: Este AGENTS.md se mantiene deliberadamente breve. Para detalles exhaustivos, consulta la documentación oficial de GitHub Actions. Ajusta ramas, gestores de paquetes y comandos de test al *stack* real del proyecto.

