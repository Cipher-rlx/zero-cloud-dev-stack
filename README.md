<div align="center">

# 🚀 zero-cloud-dev-stack

### A free, local alternative to Claude Code
**Aider + Ollama + Open WebUI + CrewAI — for Windows**

![Ollama](https://img.shields.io/badge/Ollama-0.30.9-black?style=flat-square&logo=ollama)
![Aider](https://img.shields.io/badge/Aider-0.86.2-blue?style=flat-square)
![Open WebUI](https://img.shields.io/badge/Open_WebUI-0.9.6-green?style=flat-square)
![Python](https://img.shields.io/badge/Python-3.11-yellow?style=flat-square&logo=python)
![License](https://img.shields.io/badge/License-MIT-orange?style=flat-square)
![Windows](https://img.shields.io/badge/Windows-11-blue?style=flat-square&logo=windows)

> *"Everything Claude Code does, but running on your machine. Free, private, and yours."*

[🇪🇸 Versión en Español](README-ES.md) · [📋 Troubleshooting](#-troubleshooting) · [⚡ Quick Start](#-quick-start)

</div>

---

## 📖 About

This guide documents a **real** installation with real errors, real fixes, and verified technical decisions. It is not a happy-path tutorial — it is what actually happened during a late-night installation session on an Acer Aspire AI running Windows.

### Hardware tested on
- **CPU:** Intel Core Ultra 9 (Meteor Lake)
- **GPU:** Intel Arc (integrated)
- **NPU:** Intel NPU (Core Ultra)
- **RAM:** 32GB
- **OS:** Windows 11

### Credits
| AI | Role |
|---|---|
| 🤖 **Grok** | Generated the first stack proposal |
| 🤖 **Gemini** | Generated the second proposal with corrections |
| 🤖 **Claude (Anthropic)** | Audited both proposals, corrected technical errors, guided the full installation, and documented everything |

---

## ⚠️ Debunked Myths

These claims circulate online and are **false** — verified during this installation:

| Myth | Verified Reality |
|------|-----------------|
| "Ollama uses the Intel NPU" | ❌ Ollama on Windows runs on CPU only |
| "I can run llama3.3:70b with 32GB RAM" | ❌ A 70B model in Q4 requires ~40GB+ |
| "AnythingLLM replaces Claude Code" | ❌ The real CLI alternative is **Aider** |
| "LM Studio has native Intel NPU support" | ❌ Open issue, unresolved |

---

## 🧰 Prerequisites

```powershell
node --version        # Node.js
choco --version       # Chocolatey  
ollama --version      # Ollama → irm https://ollama.com/install.ps1 | iex
py -0                 # Must show Python 3.11 available
```

---

## ⚡ Quick Start

```powershell
# 1. Download models (one-time)
ollama pull qwen2.5-coder:32b   # 19GB — takes ~2 hours
ollama pull qwen2.5-coder:7b    # 4.7GB — takes ~30 min

# 2. Coding agent (≈ Claude Code):
cd C:\your-project
C:\aider-env\Scripts\aider --model ollama/qwen2.5-coder:32b --no-auto-commits

# 3. Web interface:
C:\webui-env\Scripts\open-webui serve
# Open: http://localhost:8080

# 4. Multi-agent:
C:\crew-env\Scripts\python.exe C:\crew_local.py

# 🔴 KILL SWITCH — free all RAM:
ollama stop qwen2.5-coder:32b
ollama stop qwen2.5-coder:7b
```

---

## 📦 Installation

### Step 1 — Aider (Claude Code alternative)

> ⚠️ **Critical:** Aider requires Python `>=3.10,<3.13`. If you have Python 3.13 or 3.14 installed (common on Windows), you **must** force Python 3.11.

```powershell
# Always use py -3.11, never just "python"
py -3.11 -m venv C:\aider-env --clear

# Verify it's 3.11:
C:\aider-env\Scripts\python.exe --version
# Must show: Python 3.11.x

# Install using absolute path (not activate):
C:\aider-env\Scripts\python.exe -m pip install "aider-chat>=0.50"

# Verify:
C:\aider-env\Scripts\aider --version
# aider 0.86.2
```

### Step 2 — Open WebUI

```powershell
py -3.11 -m venv C:\webui-env
C:\webui-env\Scripts\python.exe -m pip install open-webui

# Start:
C:\webui-env\Scripts\open-webui serve
# Wait for: "Uvicorn running on http://0.0.0.0:8080"
# Then open: http://localhost:8080
```

### Step 3 — CrewAI

```powershell
py -3.11 -m venv C:\crew-env
C:\crew-env\Scripts\python.exe -m pip install crewai crewai-tools
```

---

## 🤖 CrewAI — Coder + Auditor Script

```python
from crewai import Agent, Task, Crew, LLM

llm_large = LLM(model="ollama/qwen2.5-coder:32b", base_url="http://localhost:11434")
llm_fast  = LLM(model="ollama/qwen2.5-coder:7b",  base_url="http://localhost:11434")

coder = Agent(
    role='Senior Python Developer',
    goal='Write efficient, clean code without inventing non-existent libraries',
    backstory='Python expert. Only deliver executable code with real imports.',
    llm=llm_large, verbose=True
)

auditor = Agent(
    role='QA and Security Auditor',
    goal='Detect bugs, invented libraries, and security issues',
    backstory='You are skeptical. If code imports something that does not exist, reject it.',
    llm=llm_fast, verbose=True
)

task_code = Task(
    description='Write an async Python function to process a large CSV with pandas.',
    expected_output='Clean Python code in a markdown block with all imports.',
    agent=coder
)

task_audit = Task(
    description='Review the generated code. Verify real imports and no obvious bugs.',
    expected_output='Approved with comments, or list of required corrections.',
    agent=auditor
)

crew = Crew(
    agents=[coder, auditor],
    tasks=[task_code, task_audit],
    process='sequential',  # sequential = doesn't saturate RAM
    verbose=True
)

result = crew.kickoff()
print("\n=== FINAL RESULT ===")
print(result)
```

---

## 🔧 Troubleshooting

Every error below was encountered and solved during the real installation.

### ❌ `Cannot import 'setuptools.build_meta'`
**Cause:** Python 3.13 or 3.14 in the virtual environment.  
**Fix:** Use `py -3.11 -m venv` instead of `python -m venv`.

### ❌ No compatible version of `aider-chat>=0.50` found
**Cause:** Python version outside range `>=3.10,<3.13`.  
**Fix:** Verify with `C:\aider-env\Scripts\python.exe --version`. Must be 3.11.x.

### ❌ `activate` still uses Python 3.14 after creating env with 3.11
**Cause:** System PATH overrides the virtual environment.  
**Fix:** Always use absolute path: `C:\aider-env\Scripts\python.exe` instead of `python`.

### ❌ `Only one usage of each socket address` when running `ollama serve`
**Cause:** Ollama is already running as a Windows service.  
**Fix:** Not an error. Ollama is already active. Verify with `ollama list`.

### ❌ Models don't appear in Open WebUI
**Cause:** Windows doesn't resolve `localhost` correctly in some contexts.  
**Fix:** Change Ollama URL from `http://localhost:11434` to `http://127.0.0.1:11434` in Admin Panel → Settings → Connections.

### ❌ `ERR_CONNECTION_REFUSED` on localhost:8080
**Cause:** Browser opened before Uvicorn finished starting.  
**Fix:** Wait for `Uvicorn running on http://0.0.0.0:8080` in the terminal first.

### ❌ Model download interrupted
**Cause:** Network error (happened at 91% on the 32B model).  
**Fix:** Re-run `ollama pull [model]`. It automatically resumes from where it stopped.

### ❌ PC very slow with everything running
**Cause:** 32B (20GB) + Open WebUI + system = ~27GB of 32GB available.  
**Fix:** Kill switch → `ollama stop qwen2.5-coder:32b`. Don't run everything simultaneously.

---

## ⚡ RAM Optimization

| Task | Model | RAM used |
|------|-------|----------|
| Complex coding | qwen2.5-coder:32b only | ~20GB |
| Quick chat | qwen2.5-coder:7b only | ~5GB |
| CrewAI coder+auditor | 32b + 7b sequential | ~25GB |

```powershell
# Check what's loaded in RAM:
ollama ps

# Free specific model:
ollama stop qwen2.5-coder:32b

# Limit parallel requests:
$env:OLLAMA_NUM_PARALLEL = "1"
```

> **Rule:** Don't run Open WebUI and CrewAI at the same time with the 32B loaded.

---

## 📊 Honest Limitations

| Limitation | Details |
|---|---|
| Frozen knowledge | Qwen2.5-coder cutoff: January 2025 |
| No internet by default | Requires manual web search setup |
| Speed | CPU is slower than Claude (10-30s per response) |
| Quality | For very complex tasks, Claude Opus is still superior |
| RAM | 32GB is the practical limit for 32B models |

### When the model doesn't know something
1. **RAG** — Upload the document in Open WebUI → Knowledge
2. **Web Search** — Enable DuckDuckGo in Open WebUI (no API key needed)
3. **Change model** — `ollama pull` a newer or specialized model

---

## 🌐 Optional: Two-Machine Network Setup

If you have a second machine with more RAM (e.g., 64GB), you can use it as a dedicated model server:

```powershell
# On the server machine:
$env:OLLAMA_HOST = "0.0.0.0:11434"
ollama serve

# On the client machine, change all URLs from localhost to the server IP:
C:\aider-env\Scripts\aider --model ollama/qwen2.5-coder:32b --openai-api-base http://192.168.1.100:11434
```

> See [docs/network-setup.md](docs/network-setup.md) for the full guide.

---

## 🗑️ Uninstall

```powershell
ollama rm qwen2.5-coder:32b
ollama rm qwen2.5-coder:7b

Remove-Item -Recurse -Force C:\aider-env
Remove-Item -Recurse -Force C:\webui-env
Remove-Item -Recurse -Force C:\crew-env

# Optional: free ~25GB of model cache
Remove-Item -Recurse -Force "$env:USERPROFILE\.ollama"
Remove-Item -Recurse -Force "$env:USERPROFILE\.cache\huggingface"
```

---

## 📋 Stack Summary

| Component | Tool | Port | Environment |
|-----------|------|------|-------------|
| Model engine | Ollama 0.30.9 | 11434 | Windows Service |
| Main coding model | qwen2.5-coder:32b | — | — |
| Auditor model | qwen2.5-coder:7b | — | — |
| CLI coding (≈ Claude Code) | Aider 0.86.2 | — | C:\aider-env (Python 3.11) |
| Web interface + RAG | Open WebUI 0.9.6 | 8080 | C:\webui-env (Python 3.11) |
| Multi-agent | CrewAI | — | C:\crew-env (Python 3.11) |

---

<div align="center">

*Guide generated in June 2026 — Installation completed at 4:35am successfully 🌙*

*Hardware: Acer Aspire AI · Intel Core Ultra 9 · Arc GPU · 32GB RAM · Windows 11*

⭐ If this saved you time, consider starring the repo!

</div>
