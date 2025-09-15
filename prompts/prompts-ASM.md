# Prompts – Adrián Sendín (ASM)  
Módulo 13 – Pipeline GitHub Actions con EC2 y SSM

Este documento recoge los **prompts utilizados**, la **evolución del trabajo**, los **roles de la IA**, los **problemas encontrados** y las **decisiones técnicas** durante la implementación del pipeline de CI/CD para el proyecto `AI4Devs-week12-pipeline-sr-01`.

---

## 👤 Autor
**Nombre:** Adrián Sendín  
**GitHub:** [@adriansendin](https://github.com/adriansendin)  
**Módulo:** Semana 12 - Pipeline de despliegue CI/CD

---

## 🧠 Roles solicitados a la IA
- **Especialista DevOps (CI/CD + GitHub Actions + AWS EC2)**  
- **Debugger de errores** en SSM y YAML  
- **Asistente AWS** para permisos IAM, SSM Agent y EC2  
- **Mentor técnico senior** en contexto AI4Devs  

---

## 📋 Evolución del trabajo

### 1️⃣ Checklist inicial (según el máster)
- Crear instancia EC2 con Amazon Linux  
- Instalar y activar `amazon-ssm-agent` + asociar IAM Role (`AmazonSSMManagedInstanceCore`)  
- Configurar Security Group (22, 80, 3010)  
- Crear repositorio y rama `pipeline-ASM`  
- Añadir secrets en GitHub (`AWS_ACCESS_ID`, `AWS_ACCESS_KEY`, `EC2_INSTANCE`)  
- Crear `pipeline.yml` que ejecute tests backend, build y deploy con SSM  

### 2️⃣ Primer pipeline.yml funcional
- CI: checkout, Node.js setup, `npm ci`, tests backend, build frontend/backend  
- Deploy remoto: `deploy.sh` generado dinámicamente y ejecutado vía SSM  
- Lanzaba backend con `nohup npm start` (puerto 3010)  
- Lanzaba frontend con `serve -s build` (puerto 3000)  
- ✅ Funcionó correctamente en GitHub Actions  

### 3️⃣ Intento siguiendo README (pm2 + nginx)
- Se modificó el script para instalar y usar **pm2** en backend y **nginx** en frontend  
- Backend: `pm2 start npm --name backend -- start`  
- Frontend: copia de `build/` a `/usr/share/nginx/html/`  
- ❌ Problema: el job de SSM quedaba en `InProgress` → el script nunca terminaba  
- Conclusión: válido manualmente, pero no apto para pipeline automatizado  

### 4️⃣ Decisión final
- Se mantuvo la versión estable (nohup/serve)  
- Commit con mensaje aclarando que **pm2/nginx colgaba en pipeline**  
- Checklist final cumplido con pipeline.yml y este archivo `prompts-ASM.md`  

---

## 🗂️ Prompts utilizados por fases

### 🧩 Fase 1 – Setup AWS + CI/CD
**Prompt:**  
> Necesito desplegar un proyecto con backend y frontend en Node.js usando GitHub Actions y EC2. Quiero evitar SSH y usar SSM. Ayúdame a montar un `pipeline.yml` que instale dependencias, haga build y despliegue usando AWS Systems Manager.  

**IA respondió:**  
Pipeline inicial con checkout, setup-node, npm ci, npm run build y script remoto con SSM.

---

### 🔎 Fase 2 – Fallo en Deploy SSM
**Prompt:**  
> El pipeline falla en el paso `Deploy to EC2 via SSM`. He configurado credenciales y la instancia está en línea. ¿Cómo depuro? ¿Dónde están los logs del agente SSM?  

**IA respondió:**  
Revisar `/var/log/amazon/ssm/amazon-ssm-agent.log`, usar `systemctl status amazon-ssm-agent`.

---

### 🧪 Fase 3 – Debug manual
**Prompt:**  
> No consigo entrar por SSH, aunque tengo la clave `.pem`. ¿Cuál es el comando exacto desde PowerShell?  

**IA respondió:**  
`ssh -i "C:\ruta\a\lti-pipeline-key.pem" ec2-user@<IP>`  
Además, ajustar permisos con `icacls` para que la clave sea válida.

---

### 🛠️ Fase 4 – Mejoras al pipeline
**Prompt:**  
> Ayúdame a codificar `deploy.sh` en base64 para evitar problemas de comillas en JSON.  

**IA respondió:**  
`B64=$(base64 deploy.sh | tr -d '\n')` y ejecución con `AWS-RunShellScript`.

---

### 🎯 Fase final – Confirmación de funcionamiento
**Prompt:**  
> Dame el pipeline final completo y funcional que construya backend y frontend y los despliegue correctamente mediante SSM.  

**IA respondió:**  
Pipeline de +75 líneas con build, test, deploy remoto vía SSM, validado en Actions.

---

## 🔧 Problemas encontrados
- **SSH bloqueado** tras reboot → IP pública cambiaba.  
- **Clave `.pem` inválida en Windows** → corregida con `icacls`.  
- **Error YAML** (`Invalid workflow file – A sequence was not expected`) → causado por guion en la primera línea.  
- **SSM colgado** con `pm2` y `nginx` → script no devolvía control.  

---

## ✅ Checklist final de entrega
- `.github/workflows/pipeline.yml` → funcional (nohup/serve).  
- `prompts/prompts-ASM.md` → documentado (este archivo).  
- Pull Request desde `pipeline-ASM` con ambos archivos.  

---

## 🚀 Conclusión
- El pipeline cumple con los **requisitos del máster**:  
  - Tests de backend.  
  - Build de backend.  
  - Deploy automático en EC2 mediante SSM.  
- Se documentó la evolución completa, con intentos alternativos (pm2/nginx) y la decisión final.  
- Entrega lista para revisión y validación.  
