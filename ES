# 🚀 zero-cloud-dev-stack
### Alternativa local y gratuita a Claude Code — Aider + Ollama + Open WebUI + CrewAI
#### Para Windows — Intel Core Ultra 9 + Arc GPU + NPU + 32GB RAM

> *"Everything Claude Code does, but running on your machine. Free, private, and yours."*

---

## 📖 Sobre esta guía

Esta guía documenta una instalación **real**, con errores reales, correcciones reales y decisiones técnicas verificadas. No es un tutorial de camino feliz — es lo que realmente pasó durante una sesión de instalación de madrugada en un Acer Aspire AI con Windows.

**Créditos:**
- 🤖 **Grok** — Generó la primera propuesta del stack
- 🤖 **Gemini** — Generó la segunda propuesta con correcciones
- 🤖 **Claude (Anthropic)** — Auditó ambas propuestas, corrigió errores técnicos, acompañó la instalación paso a paso y documentó todo

---

## ⚠️ Mitos corregidos — Verdad técnica verificada

Antes de empezar, estas afirmaciones circulan en internet y son **falsas**:

| Mito | Realidad verificada |
|------|---------------------|
| "Ollama usa la NPU de Intel" | ❌ Ollama en Windows corre en CPU únicamente. Para NPU Intel se necesita OpenVINO o IPEX-LLM |
| "Puedo correr llama3.3:70b con 32GB RAM" | ❌ Un modelo 70B en Q4 requiere ~40GB+. No entra en 32GB |
| "AnythingLLM reemplaza a Claude Code" | ❌ Son herramientas distintas. La alternativa real a Claude Code CLI es **Aider** |
| "LM Studio tiene soporte nativo para NPU Intel" | ❌ Falso. LM Studio usa llama.cpp y no tiene soporte NPU Intel. Issue abierto sin resolver |

---

## 🧰 Prerequisitos verificados

Antes de empezar, verificá que tenés instalado:

```powershell
node --version        # Node.js
choco --version       # Chocolatey
ollama --version      # Ollama (instalado con: irm https://ollama.com/install.ps1 | iex)
py -0                 # Debe mostrar Python 3.11, 3.13 y/o 3.14
```

> **Importante sobre Python:** Si tenés múltiples versiones instaladas, el sistema puede usar la versión equivocada. Verificá siempre con `py -0` cuáles tenés disponibles.

---

## 📦 PASO 1 — Verificar Ollama

```powershell
ollama --version
ollama list
```

Si `ollama list` devuelve una tabla vacía, Ollama está funcionando pero sin modelos todavía.

**Versión instalada en esta guía:** `ollama version 0.30.9`

---

## 🧠 PASO 2 — Descargar modelos

### Por qué estos dos modelos específicos para 32GB de RAM:

| Modelo | Tamaño | Uso | RAM ocupada |
|--------|--------|-----|-------------|
| qwen2.5-coder:32b | 19GB | Coding principal, razonamiento | ~20GB |
| qwen2.5-coder:7b | 4.7GB | Auditor rápido, verificación | ~5GB |

> Los dos juntos usan ~25GB, dejando ~7GB para el sistema operativo y otras apps.

### Modelo principal:
```powershell
ollama pull qwen2.5-coder:32b
```
⏱️ Tiempo estimado: 1.5-2 horas según conexión (19GB)

### Modelo auditor:
```powershell
ollama pull qwen2.5-coder:7b
```
⏱️ Tiempo estimado: 20-30 minutos (4.7GB)

### Verificar descarga:
```powershell
ollama list
# Debe mostrar:
# qwen2.5-coder:32b    b92d6a0bd47e    19 GB
# qwen2.5-coder:7b     60e05f210007    4.7 GB
```

### ⚠️ Error conocido: Descarga interrumpida
Si la descarga se corta por error de red:
```
Error: max retries exceeded: read tcp ...wsarecv: An established connection was aborted
```
**Solución:** Ollama tiene resume automático. Simplemente volvé a ejecutar el mismo comando y retoma desde donde se cortó.

---

## 💻 PASO 3 — Aider (La alternativa real a Claude Code)

Aider es una herramienta CLI que se conecta a tu repositorio, edita archivos, hace commits automáticos y entiende todo tu codebase.

### ⚠️ PROBLEMA REAL ENCONTRADO: Python 3.14 incompatible

**Síntoma:**
```
ERROR: pip._vendor.pyproject_hooks._impl.BackendUnavailable: Cannot import 'setuptools.build_meta'
```

**Causa:** El entorno virtual tomó Python 3.14 (que no soporta Aider) en lugar de 3.11.

**Por qué pasa:** Si tenés múltiples versiones de Python instaladas y 3.14 está primero en el PATH del sistema, `python -m venv` siempre va a usar 3.14.

**Verificar tus versiones:**
```powershell
py -0
# Resultado en esta instalación:
#  -V:3.14 *        Python 3.14 (64-bit)   ← default del sistema
#  -V:3.13          Python 3.13
#  -V:3.11          Python 3.11
```

**Versiones compatibles con Aider:**
- ✅ Python 3.11
- ✅ Python 3.12
- ❌ Python 3.13 (incompatible con dependencias viejas)
- ❌ Python 3.14 (demasiado nuevo, muchas dependencias sin wheels)

### 3.1 Crear entorno virtual forzando Python 3.11:

```powershell
py -3.11 -m venv C:\aider-env --clear
```

**Verificar que quedó con 3.11:**
```powershell
C:\aider-env\Scripts\python.exe --version
# Debe decir: Python 3.11.9
```

> ⚠️ **No uses `activate` para instalar.** Si tenés Python 3.14 primero en el PATH, el comando `activate` puede ser sobreescrito. Usá siempre la ruta absoluta al ejecutable del entorno.

### 3.2 Instalar Aider usando ruta directa:

```powershell
C:\aider-env\Scripts\python.exe -m pip install "aider-chat>=0.50"
```

**Versión instalada:** `aider-chat-0.86.2`

### 3.3 Verificar instalación:

```powershell
C:\aider-env\Scripts\aider --version
# aider 0.86.2
```

### 3.4 Usar Aider con Ollama:

```powershell
cd C:\ruta\a\tu\proyecto
C:\aider-env\Scripts\aider --model ollama/qwen2.5-coder:32b --no-auto-commits
```

**Flags útiles:**
- `--no-auto-commits` → no hace commits automáticos (recomendado al principio)
- `--watch-files` → detecta cambios en archivos automáticamente
- `--model ollama/qwen2.5-coder:7b` → usa el modelo rápido si querés velocidad

**Comandos dentro de Aider:**
```
/add archivo.py          # Agrega un archivo al contexto
/drop archivo.py         # Lo quita del contexto
/diff                    # Muestra los cambios hechos
/undo                    # Revierte el último cambio
/run python archivo.py   # Ejecuta y muestra el output al modelo
/help                    # Lista todos los comandos
```

---

## 🎨 PASO 4 — Open WebUI (Interfaz web)

Chat estilo ChatGPT pero 100% local, con RAG, historial y multi-modelo.

### 4.1 Crear entorno virtual con Python 3.11:

```powershell
py -3.11 -m venv C:\webui-env
```

### 4.2 Instalar Open WebUI:

```powershell
C:\webui-env\Scripts\python.exe -m pip install open-webui
```

**Versión instalada:** `open-webui-0.9.6`
⏱️ Tiempo estimado: 15-20 minutos (descarga ~500MB de dependencias incluyendo PyTorch)

### 4.3 Iniciar Open WebUI:

```powershell
C:\webui-env\Scripts\open-webui serve
```

La primera vez descarga modelos de embeddings de HuggingFace (~931MB). Esperar hasta ver:
```
INFO: Started server process
INFO: Uvicorn running on http://0.0.0.0:8080
```

### 4.4 Abrir en el navegador:

```
http://localhost:8080
```

> ⚠️ **No abras el navegador antes de ver el mensaje de Uvicorn.** Vas a ver `ERR_CONNECTION_REFUSED`.

### ⚠️ PROBLEMA REAL ENCONTRADO: Firewall de Windows

Windows va a pedir permiso para que Open WebUI use la red. **Aceptar para redes públicas Y privadas.** Es necesario para que funcione en localhost.

### ⚠️ PROBLEMA REAL ENCONTRADO: Modelos no aparecen en Open WebUI

**Síntoma:** "No hay modelos disponibles"

**Causa:** Open WebUI intenta conectar a `localhost:11434` pero Windows a veces no resuelve `localhost` correctamente.

**Solución:**
1. Ir a Admin Panel → Settings → Connections → Gestionar Conexiones API de Ollama
2. Cambiar `http://localhost:11434` por `http://127.0.0.1:11434`
3. Guardar

### 4.5 Cuenta admin (primera vez):

Crear cuenta con cualquier dato — es 100% local:
- Email: `admin@local.com`
- Contraseña: la que quieras

### 4.6 Activar Web Search en Open WebUI:

Para casos donde el modelo no sabe algo o necesita información reciente:
1. Admin Panel → Settings → Web Search
2. Activar **Enable Web Search**
3. Seleccionar **DuckDuckGo** (no requiere API key)
4. Guardar

En el chat aparecerá un ícono de búsqueda web que podés activar por conversación.

---

## 🤖 PASO 5 — CrewAI (Multi-agente)

Para crear flujos donde un agente codifica y otro audita, minimizando alucinaciones.

### 5.1 Crear entorno virtual:

```powershell
py -3.11 -m venv C:\crew-env
C:\crew-env\Scripts\python.exe -m pip install crewai crewai-tools
```

### 5.2 Script Coder + Auditor local:

Crear archivo `C:\crew_local.py`:

```python
from crewai import Agent, Task, Crew, LLM

# Conexión a Ollama
llm_grande = LLM(
    model="ollama/qwen2.5-coder:32b",
    base_url="http://localhost:11434"
)

llm_rapido = LLM(
    model="ollama/qwen2.5-coder:7b",
    base_url="http://localhost:11434"
)

# Agente 1: El que codifica
coder = Agent(
    role='Senior Python Developer',
    goal='Escribir código eficiente y limpio, sin inventar librerías inexistentes',
    backstory='Experto en Python. Solo entregás código ejecutable con imports reales.',
    llm=llm_grande,
    verbose=True
)

# Agente 2: El auditor
auditor = Agent(
    role='QA y Security Auditor',
    goal='Detectar bugs, librerías inventadas y problemas de seguridad',
    backstory='Sos escéptico. Si el código importa algo inexistente, lo rechazás.',
    llm=llm_rapido,
    verbose=True
)

tarea_codigo = Task(
    description='Escribí una función Python asíncrona para procesar un CSV con pandas.',
    expected_output='Código Python limpio en markdown con todos los imports.',
    agent=coder
)

tarea_auditoria = Task(
    description='Revisá el código. Verificá imports reales y ausencia de bugs.',
    expected_output='Aprobado con comentarios, o lista de correcciones.',
    agent=auditor
)

# Proceso secuencial — no satura RAM
crew = Crew(
    agents=[coder, auditor],
    tasks=[tarea_codigo, tarea_auditoria],
    process='sequential',
    verbose=True
)

resultado = crew.kickoff()
print("\n=== RESULTADO FINAL ===")
print(resultado)
```

### 5.3 Ejecutar:

```powershell
C:\crew-env\Scripts\python.exe C:\crew_local.py
```

---

## ⚡ PASO 6 — Optimización Intel (NPU/Arc) — Verdad verificada

| Herramienta | GPU Arc | NPU | Notas |
|---|---|---|---|
| Ollama | ❌ solo CPU en Windows | ❌ | Funcional igual |
| LM Studio | ✅ vía llama.cpp | ❌ | Issue NPU abierto sin resolver |
| OpenVINO + llama.cpp | ✅ | ✅ solo hasta 7B | Experimental |

### Opción recomendada para empezar — Solo Ollama en CPU:

El Core Ultra 9 en CPU es suficientemente rápido para uso cotidiano. No necesitás OpenVINO para arrancar.

### Opción avanzada — OpenVINO (experimental):

```powershell
pip install openvino openvino-genai optimum[openvino]

# Verificar hardware detectado
python -c "from openvino import Core; print(Core().available_devices)"
# Esperado: ['CPU', 'GPU', 'NPU']
```

> **Limitación real:** La NPU del Core Ultra Series 1 solo corre modelos hasta ~7B en INT4. Para el 32B, la CPU es más rápida.

---

## 🔥 PASO 7 — Kill Switch y Optimización de RAM

### ⚠️ PROBLEMA REAL ENCONTRADO: PC muy lenta con todo corriendo junto

Con el 32B cargado en RAM (~20GB) + Open WebUI + PowerShell, el sistema puede ponerse muy lento. Esto es normal — estás usando ~27GB de los 32GB disponibles.

### Kill Switch completo — liberar toda la RAM:

```powershell
# Detener modelos cargados en RAM
ollama stop qwen2.5-coder:32b
ollama stop qwen2.5-coder:7b

# Verificar que se liberaron
ollama ps
# Debe mostrar tabla vacía
```

### Ver qué modelos están consumiendo RAM:

```powershell
ollama ps
# Muestra: nombre, ID, tamaño, tiempo de uso
```

### Evitar saturación con múltiples requests:

```powershell
# Antes de iniciar Ollama, limitar requests paralelos
$env:OLLAMA_NUM_PARALLEL = "1"
```

### Estrategia de uso recomendada para 32GB:

| Tarea | Modelo a usar | RAM usada |
|-------|--------------|-----------|
| Coding complejo | qwen2.5-coder:32b solo | ~20GB |
| Chat rápido / preguntas | qwen2.5-coder:7b solo | ~5GB |
| CrewAI coder+auditor | 32b + 7b secuencial | ~25GB |
| Open WebUI abierto | Cerrar si no se usa | libera RAM |

> **Regla práctica:** No corras Open WebUI y CrewAI al mismo tiempo con el 32B cargado.

---

## 🔒 PASO 8 — Seguridad y buenas prácticas

```powershell
# Ver uso de RAM por modelos
ollama ps

# Liberar modelo específico
ollama stop qwen2.5-coder:32b

# Nunca guardes API keys en el código
# Usá variables de entorno:
$env:OPENAI_API_KEY = "tu-key"
# O archivo .env (agregar .env al .gitignore)
```

**Para agentes con tool-calling:**
- Nunca ejecutes Aider o CrewAI con permisos de administrador
- Usá `--no-auto-commits` en Aider hasta que confíes en el modelo
- Para ejecución de código arbitrario, usá Docker como sandbox

---

## 📋 PASO 9 — Cómo arrancar el stack (uso diario)

```powershell
# ✅ Ollama corre automáticamente como servicio de Windows
# Verificar que está corriendo:
ollama ps

# 🔵 SOLO CODING (equivalente a Claude Code):
cd C:\tu-proyecto
C:\aider-env\Scripts\aider --model ollama/qwen2.5-coder:32b --no-auto-commits

# 🟣 SOLO CHAT con interfaz web:
C:\webui-env\Scripts\open-webui serve
# Abrir: http://localhost:8080

# 🟠 SOLO MULTI-AGENTE:
C:\crew-env\Scripts\python.exe C:\crew_local.py

# 🔴 APAGAR TODO y liberar RAM:
ollama stop qwen2.5-coder:32b
ollama stop qwen2.5-coder:7b
# Ctrl+C en la ventana de Open WebUI
```

---

## ❓ Cuando el modelo no sabe algo

**Opción 1 — RAG:** Subí el documento en Open WebUI → Knowledge y el modelo lo usa como contexto.

**Opción 2 — Web Search:** Activá la búsqueda web en Open WebUI (DuckDuckGo, sin API key).

**Opción 3 — Cambiar modelo:** `ollama pull` un modelo más nuevo o especializado.

---

## 📊 Limitaciones honestas del stack

| Limitación | Detalle |
|---|---|
| Conocimiento congelado | Qwen2.5-coder tiene cutoff en enero 2025 |
| Sin internet por defecto | Requiere configurar web search manualmente |
| Velocidad | En CPU es más lento que Claude (10-30s por respuesta) |
| Calidad | Para tareas muy complejas, Claude Opus sigue siendo superior |
| RAM | 32GB es el límite práctico para modelos de 32B |

---

## 🗑️ Desinstalación completa

```powershell
# 1. Eliminar modelos de Ollama
ollama rm qwen2.5-coder:32b
ollama rm qwen2.5-coder:7b

# 2. Eliminar entornos virtuales
Remove-Item -Recurse -Force C:\aider-env
Remove-Item -Recurse -Force C:\webui-env
Remove-Item -Recurse -Force C:\crew-env

# 3. Desinstalar Ollama
# Panel de Control → Programas → Ollama → Desinstalar

# 4. Limpiar caché de modelos (opcional, libera ~25GB)
Remove-Item -Recurse -Force "$env:USERPROFILE\.ollama"

# 5. Limpiar caché de HuggingFace (Open WebUI)
Remove-Item -Recurse -Force "$env:USERPROFILE\.cache\huggingface"
```

---

## 🔧 Troubleshooting completo

### Error: `Cannot import 'setuptools.build_meta'`
**Causa:** Python 3.13 o 3.14 en el entorno virtual.
**Solución:** Usar `py -3.11 -m venv` en lugar de `python -m venv`.

### Error: `aider-chat>=0.50` no encuentra versión compatible
**Causa:** Versión de Python fuera del rango `>=3.10,<3.13`.
**Solución:** Verificar con `C:\aider-env\Scripts\python.exe --version`. Debe ser 3.11.x.

### Error: `activate` sigue usando Python 3.14 después de crear el entorno con 3.11
**Causa:** El PATH del sistema sobreescribe el entorno virtual.
**Solución:** Usar siempre la ruta absoluta: `C:\aider-env\Scripts\python.exe` en lugar de `python`.

### Error: `Only one usage of each socket address` al ejecutar `ollama serve`
**Causa:** Ollama ya está corriendo como servicio de Windows.
**Solución:** No es un error real. Ollama ya está activo. Verificar con `ollama list`.

### Error: Modelos no aparecen en Open WebUI
**Causa:** Windows no resuelve `localhost` correctamente en algunos contextos.
**Solución:** Cambiar URL de Ollama de `http://localhost:11434` a `http://127.0.0.1:11434`.

### PC muy lenta con todo corriendo
**Causa:** 32B (20GB) + Open WebUI + sistema = ~27GB de 32GB.
**Solución:** Kill switch → `ollama stop qwen2.5-coder:32b`. No corras todo junto.

### Descarga de modelo interrumpida
**Causa:** Error de red, corte de conexión.
**Solución:** Volver a ejecutar `ollama pull [modelo]`. Retoma automáticamente desde donde se cortó.

---

## 📋 Resumen del stack

| Componente | Herramienta | Puerto | Entorno |
|------------|-------------|--------|---------|
| Motor de modelos | Ollama 0.30.9 | 11434 | Servicio Windows |
| Modelo coding principal | qwen2.5-coder:32b | — | — |
| Modelo auditor | qwen2.5-coder:7b | — | — |
| CLI coding (≈ Claude Code) | Aider 0.86.2 | — | C:\aider-env (Python 3.11) |
| Interfaz web + RAG | Open WebUI 0.9.6 | 8080 | C:\webui-env (Python 3.11) |
| Multi-agente | CrewAI | — | C:\crew-env (Python 3.11) |

---

*Guía generada en junio 2026 — Hardware: Acer Aspire AI, Intel Core Ultra 9, Arc GPU, 32GB RAM*
*Instalación completada a las 4:35am con éxito 🌙*

---

## 🌐 ANEXO OPCIONAL — Setup en Red con Dos Máquinas

> Este anexo es opcional. Si solo tenés una PC, ignoralo. Si tenés una segunda máquina disponible, esta configuración elimina los problemas de RAM y lentitud.

### La idea

En lugar de correr todo en una sola PC, separás los roles:

```
Acer Aspire AI (cliente)     HP Victus (servidor de modelos)
─────────────────────────    ──────────────────────────────
Aider                   →→→  Ollama + qwen2.5-coder:32b
Open WebUI              →→→  corriendo en red local
CrewAI                  →→→  IP: 192.168.x.x:11434
VS Code + trabajo diario
```

El Acer usa los modelos del Victus sin cargar nada localmente. La PC de trabajo queda liviana.

### ¿Por qué el HP Victus es mejor como servidor?

| Característica | Acer Aspire AI | HP Victus |
|---|---|---|
| RAM | 32GB | 64GB ✅ |
| NPU | ✅ (sin soporte real aún) | ❌ |
| Ventaja para modelos | — | Doble RAM = sin lentitud |

Con 64GB el Victus corre 32B + 7B + Open WebUI sin que la PC se ponga lenta.

### Paso 1 — Configurar el Victus como servidor

En el HP Victus (el que va a servir los modelos):

```powershell
# Windows:
$env:OLLAMA_HOST = "0.0.0.0:11434"
ollama serve

# Linux (recomendado):
OLLAMA_HOST=0.0.0.0:11434 ollama serve
```

Verificar la IP del Victus:
```powershell
ipconfig
# Buscar: Dirección IPv4 → ejemplo: 192.168.1.100
```

### Paso 2 — Conectar el Acer al Victus

En el Acer, cambiar todas las URLs de `localhost:11434` por la IP del Victus:

**Aider:**
```powershell
C:\aider-env\Scripts\aider --model ollama/qwen2.5-coder:32b --openai-api-base http://192.168.1.100:11434
```

**Open WebUI:**
Admin Panel → Settings → Connections → Ollama URL:
```
http://192.168.1.100:11434
```

**CrewAI (crew_local.py):**
```python
llm_grande = LLM(
    model="ollama/qwen2.5-coder:32b",
    base_url="http://192.168.1.100:11434"  # IP del Victus
)
```

### Paso 3 — Linux en el Victus (opcional pero recomendado)

Linux es ~20-30% más rápido que Windows para Ollama:

| Aspecto | Windows | Linux |
|---|---|---|
| Velocidad Ollama | Base | ~20-30% más rápido |
| RAM libre para modelos | Menos | Más |
| Estabilidad | Regular | Superior |
| Soporte GPU Arc | Limitado | Mejor |

**Distro recomendada:** Ubuntu 24.04 LTS

Instalación de Ollama en Ubuntu:
```bash
curl -fsSL https://ollama.com/install.sh | sh
OLLAMA_HOST=0.0.0.0:11434 ollama serve
```

### Resumen del setup ideal con dos máquinas

```
HP Victus (Ubuntu 24.04) → Servidor dedicado de modelos
├── Ollama siempre corriendo
├── qwen2.5-coder:32b y 7b cargados
└── 64GB RAM = sin swapping, sin lentitud

Acer Aspire AI (Windows) → Estación de trabajo
├── Aider conectado al Victus
├── Open WebUI conectado al Victus
└── VS Code + trabajo diario sin lag
```

> **Nota de seguridad:** Esta configuración solo funciona en red local (WiFi/cable del mismo router). No expongas el puerto 11434 a internet.


---

## 🎨 ANEXO OPCIONAL — Open Design (Diseño local con IA)

> Para cuando necesitás generar prototipos, slides, dashboards o sistemas de diseño — sin pagar Figma ni Claude Design.

**Open Design** es la alternativa open-source local a Claude Design. Conecta tus agentes ya instalados (Aider, Qwen, Gemini) con un flujo completo de diseño.

- 🔗 Sitio oficial: https://open-design.ai
- 📦 GitHub: https://github.com/nexu-io/open-design (67K⭐)
- 📄 Licencia: Apache-2.0 (completamente gratis)

### ¿Qué puede hacer?
- Generar prototipos HTML listos para producción
- Crear slides y presentaciones con un prompt
- Generar dashboards y sistemas de diseño
- Convertir un prompt o artículo a video MP4
- Compatible con Aider, Qwen, Gemini CLI, Claude Code y 17 agentes más

### ¿Por qué es relevante para nuestro stack?
Ya tenés Aider y Qwen instalados. Open Design los conecta a un flujo de diseño completo sin cambiar nada. Usás los mismos modelos para código Y para diseño.

### Instalación:
```powershell
# Requiere Node.js (ya lo tenés instalado)
# Descargar el desktop app desde:
# https://open-design.ai/download/
```

---

## 🔑 ANEXO — Estrategia con API Keys (Google + Claude)

Si tenés API keys de Google (plan gratuito) y Claude ($5 crédito), podés construir una estrategia de 4 capas sin costo adicional diario:

| Capa | Herramienta | Cuándo usarla | Costo |
|------|------------|---------------|-------|
| 1 | Qwen2.5-coder:7b (local) | Tareas rápidas, verificación | Gratis |
| 2 | Qwen2.5-coder:32b (local) | Coding complejo, razonamiento | Gratis |
| 3 | Gemini API (Google gratis) | Búsqueda web, embeddings, tasks medias | Gratis (15 req/min) |
| 4 | Claude API ($5 crédito) | Tareas críticas, debugging profundo | $5 = ~5M tokens Haiku |

### Configurar Gemini en Aider:
```powershell
$env:GEMINI_API_KEY = "tu-api-key-de-google"
C:\aider-env\Scripts\aider --model gemini/gemini-2.0-flash-exp --no-auto-commits
```

### Configurar Claude API en Aider:
```powershell
$env:ANTHROPIC_API_KEY = "tu-api-key-de-claude"
C:\aider-env\Scripts\aider --model claude-haiku-4-5 --no-auto-commits
```

> **Recomendación:** Guardá las API keys en un archivo `.env` en tu proyecto y nunca las commiteés a GitHub. Agregá `.env` al `.gitignore`.

```
# .env (ejemplo)
GEMINI_API_KEY=AIza...
ANTHROPIC_API_KEY=sk-ant-...
```

### Configurar Gemini en Open WebUI:
Admin Panel → Settings → Connections → Añadir conexión OpenAI:
- URL: `https://generativelanguage.googleapis.com/v1beta/openai/`
- API Key: tu clave de Google
- Modelo: `gemini-2.0-flash-exp`
