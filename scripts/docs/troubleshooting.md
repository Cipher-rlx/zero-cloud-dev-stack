# 🔧 Troubleshooting — Real Errors & Solutions

> Every error in this document was encountered and solved during the real installation on June 18, 2026.
> Hardware: Acer Aspire AI · Intel Core Ultra 9 · 32GB RAM · Windows 11 · Python 3.11 / 3.13 / 3.14

---

## ❌ Error 1: `Cannot import 'setuptools.build_meta'`

**Tool:** Aider  
**Full error:**
```
pip._vendor.pyproject_hooks._impl.BackendUnavailable: Cannot import 'setuptools.build_meta'
```

**Cause:** The virtual environment picked up Python 3.13 or 3.14. The dependency `numpy==1.24.3` (required by old aider versions) has no wheels for Python 3.13+.

**Root cause:** If you have multiple Python versions installed and 3.13/3.14 is first in the system PATH, `python -m venv` always uses it.

**Fix:**
```powershell
py -3.11 -m venv C:\aider-env --clear
C:\aider-env\Scripts\python.exe --version
# Must show: Python 3.11.x
```

---

## ❌ Error 2: No compatible version of `aider-chat>=0.50` found

**Tool:** Aider  
**Full error:**
```
ERROR: Could not find a version that satisfies the requirement aider-chat>=0.50
ERROR: Ignored the following versions that require a different python version:
  0.83.0 Requires-Python >=3.10,<3.13 ...
```

**Cause:** All modern versions of Aider (0.50+) require Python `>=3.10,<3.13`. Python 3.13 and 3.14 are explicitly excluded.

**Compatible Python versions for Aider:**
- ✅ Python 3.10
- ✅ Python 3.11 ← recommended
- ✅ Python 3.12
- ❌ Python 3.13
- ❌ Python 3.14

**Fix:**
```powershell
py -3.11 -m venv C:\aider-env --clear
C:\aider-env\Scripts\python.exe -m pip install "aider-chat>=0.50"
```

---

## ❌ Error 3: `activate` still uses Python 3.14 after creating env with 3.11

**Tool:** Aider / Open WebUI  
**Symptom:** After running `C:\aider-env\Scripts\activate`, then `python --version` still shows 3.14.

**Cause:** When Python 3.14 is first in the system PATH, it overrides the virtual environment's python command in the current PowerShell session.

**Diagnosis:**
```powershell
Get-Command python | Select-Object -ExpandProperty Source
# Shows: C:\Python314\python.exe  ← problem
```

**Fix — Always use absolute path, never `activate`:**
```powershell
# WRONG:
activate
python --version  # returns 3.14

# CORRECT:
C:\aider-env\Scripts\python.exe --version  # returns 3.11.9
C:\aider-env\Scripts\python.exe -m pip install "aider-chat>=0.50"
C:\aider-env\Scripts\aider --version
```

---

## ❌ Error 4: `Only one usage of each socket address`

**Tool:** Ollama  
**Full error:**
```
Error: listen tcp 127.0.0.1:11434: bind: Only one usage of each socket address
(protocol/network address/port) is normally permitted.
```

**Cause:** Ollama installs itself as a Windows service and starts automatically. Running `ollama serve` manually tries to bind the same port that's already in use.

**This is NOT a real error** — Ollama is already running correctly.

**Fix:**
```powershell
# Don't run ollama serve manually.
# Just verify Ollama is working:
ollama list
ollama ps
```

---

## ❌ Error 5: Models don't appear in Open WebUI

**Tool:** Open WebUI  
**Symptom:** After connecting Ollama, the model selector shows "No models available" even though `ollama list` shows models correctly.

**Cause:** Windows doesn't always resolve `localhost` correctly inside certain app contexts. This is a known Windows networking quirk.

**Fix:**
1. Go to Admin Panel → Settings → Connections → Manage Ollama API Connections
2. Change `http://localhost:11434` → `http://127.0.0.1:11434`
3. Save

---

## ❌ Error 6: `ERR_CONNECTION_REFUSED` on localhost:8080

**Tool:** Open WebUI  
**Symptom:** Opening `http://localhost:8080` shows "This site can't be reached".

**Cause:** The browser was opened before Uvicorn finished initializing. On first run, Open WebUI downloads ~931MB of HuggingFace embedding models before starting.

**Fix:** Wait until you see this line in the terminal:
```
INFO: Uvicorn running on http://0.0.0.0:8080 (Press CTRL+C to quit)
```
Only then open the browser.

**Note:** First run takes 5-10 minutes due to model downloads. Subsequent runs start in ~10 seconds.

---

## ❌ Error 7: Model download interrupted at 91%

**Tool:** Ollama  
**Full error:**
```
Error: max retries exceeded: read tcp 172.20.10.3:57544->172.64.66.1:443: 
wsarecv: An established connection was aborted by the software in your host machine.
```

**Cause:** Network connection dropped during the 19GB download of qwen2.5-coder:32b.

**Fix:** Ollama has automatic resume. Simply re-run the same command:
```powershell
ollama pull qwen2.5-coder:32b
# Resumes from where it stopped — no re-download from scratch
```

---

## ❌ Error 8: PC very slow / unresponsive with everything running

**Tool:** All  
**Symptom:** System becomes sluggish, mouse lags, apps take forever to respond.

**Cause:** Running qwen2.5-coder:32b (~20GB) + Open WebUI + system OS simultaneously on 32GB RAM leaves very little memory for anything else (~5-7GB free).

**Immediate fix — Kill Switch:**
```powershell
ollama stop qwen2.5-coder:32b
ollama stop qwen2.5-coder:7b
# Also press Ctrl+C in the Open WebUI terminal window
```

**Prevention:**
```powershell
# Limit parallel requests to avoid RAM spikes:
$env:OLLAMA_NUM_PARALLEL = "1"

# Check RAM usage before starting:
ollama ps
```

**Strategy — don't run everything at once:**

| Scenario | What to run | RAM used |
|---|---|---|
| Coding session | Aider + 32B only | ~20GB |
| Quick questions | Open WebUI + 7B only | ~5GB |
| Multi-agent | CrewAI sequential (32B then 7B) | ~25GB peak |

---

## ❌ Error 9: Windows Firewall popup when starting Open WebUI

**Tool:** Open WebUI  
**Symptom:** Windows asks if you want to allow Open WebUI to communicate on public and private networks.

**This is expected behavior.** Open WebUI needs network access to listen on localhost.

**Fix:** Click **Allow access** for BOTH public and private networks. Without this, the server won't be reachable at `http://localhost:8080`.

---

## 🔍 Quick Diagnostic Commands

```powershell
# Check Python versions available:
py -0

# Check which python is being used:
Get-Command python | Select-Object -ExpandProperty Source

# Check Ollama status:
ollama list
ollama ps

# Check if port 11434 is in use:
netstat -ano | findstr :11434

# Check if port 8080 is in use:
netstat -ano | findstr :8080

# Check virtual environment Python version:
C:\aider-env\Scripts\python.exe --version
C:\webui-env\Scripts\python.exe --version
C:\crew-env\Scripts\python.exe --version
```

---

*All errors documented from real installation — June 18, 2026, 4:35am 🌙*
