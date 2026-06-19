# 🌐 Optional: Two-Machine Network Setup

> This guide is optional. If you only have one PC, skip it entirely.
> If you have a second machine with more RAM, this setup eliminates the slowness issues.

---

## The Problem This Solves

Running qwen2.5-coder:32b on a 32GB machine leaves very little RAM for the OS and other apps. The PC becomes slow and unresponsive.

**Solution:** Use a second machine as a dedicated model server.

---

## Architecture

```
Acer Aspire AI (client)          HP Victus / Second PC (model server)
────────────────────────         ──────────────────────────────────────
Aider                  ───────→  Ollama + qwen2.5-coder:32b
Open WebUI             ───────→  always running
CrewAI                 ───────→  IP: 192.168.x.x:11434
VS Code + daily work
(stays fast and light)           (dedicated to AI inference)
```

The client machine uses the server's models without loading anything locally. The workstation stays fast.

---

## Hardware Comparison

| Feature | Acer Aspire AI | HP Victus (example) |
|---------|----------------|---------------------|
| RAM | 32GB | 64GB ✅ |
| NPU | ✅ (no real support yet) | ❌ |
| Best for | Daily work, client tools | Model server |
| Advantage | Portability | Double RAM = no slowness |

With 64GB, the server runs 32B + 7B + Open WebUI without any performance issues.

---

## Step 1 — Configure the Server Machine

On the machine that will serve models (the more powerful one):

**Windows:**
```powershell
$env:OLLAMA_HOST = "0.0.0.0:11434"
ollama serve
```

**Linux (recommended for server — ~20-30% faster):**
```bash
OLLAMA_HOST=0.0.0.0:11434 ollama serve
```

To make it permanent on Linux:
```bash
sudo systemctl edit ollama.service
# Add under [Service]:
# Environment="OLLAMA_HOST=0.0.0.0:11434"
sudo systemctl restart ollama
```

### Find the server's IP address:

**Windows:**
```powershell
ipconfig
# Look for: IPv4 Address → example: 192.168.1.100
```

**Linux:**
```bash
hostname -I
# example: 192.168.1.100
```

---

## Step 2 — Connect the Client Machine

On the Acer (or any client), replace all `localhost:11434` with the server's IP.

### Aider:
```powershell
C:\aider-env\Scripts\aider `
  --model ollama/qwen2.5-coder:32b `
  --openai-api-base http://192.168.1.100:11434 `
  --no-auto-commits
```

### Open WebUI:
Admin Panel → Settings → Connections → Manage Ollama API Connections:
```
http://192.168.1.100:11434
```

### CrewAI (crew_local.py):
```python
llm_large = LLM(
    model="ollama/qwen2.5-coder:32b",
    base_url="http://192.168.1.100:11434"  # ← server IP
)

llm_fast = LLM(
    model="ollama/qwen2.5-coder:7b",
    base_url="http://192.168.1.100:11434"  # ← server IP
)
```

---

## Step 3 — Linux on the Server (Optional but Recommended)

Linux runs Ollama significantly faster than Windows:

| Aspect | Windows | Linux |
|--------|---------|-------|
| Ollama speed | Baseline | ~20-30% faster |
| Free RAM for models | Less (OS overhead) | More |
| Stability | Regular | Superior |
| Intel Arc GPU support | Limited | Better (Mesa drivers) |
| Setup complexity | Easy | Medium |

### Recommended distro: Ubuntu 24.04 LTS

```bash
# Install Ollama on Ubuntu:
curl -fsSL https://ollama.com/install.sh | sh

# Start with network access:
OLLAMA_HOST=0.0.0.0:11434 ollama serve

# Pull models:
ollama pull qwen2.5-coder:32b
ollama pull qwen2.5-coder:7b
```

---

## Ideal Two-Machine Setup

```
HP Victus (Ubuntu 24.04) — Dedicated Model Server
├── Ollama always running (systemd service)
├── qwen2.5-coder:32b loaded (~20GB)
├── qwen2.5-coder:7b loaded (~5GB)
└── 64GB RAM → no swapping, no slowness

Acer Aspire AI (Windows) — Daily Workstation  
├── Aider → connects to Victus
├── Open WebUI → connects to Victus
├── VS Code + EduTranslate AI development
└── Fast, responsive, no RAM pressure
```

---

## Mac Mini Cluster Reference

The Mac Mini clusters you've seen online use the same architecture:
- Multiple Mac Minis each running Ollama
- One machine acts as the "coordinator" running the client tools
- Models are distributed or mirrored across machines

Our setup achieves the same result with existing hardware.

---

## Security Note

> ⚠️ This setup only works on your **local network** (same router, WiFi or cable).
> 
> **Never expose port 11434 to the internet.** Ollama has no authentication by default.
> If you need remote access, use a VPN or SSH tunnel instead.

---

*Guide written June 2026 — Part of [zero-cloud-dev-stack](https://github.com/Cipher-rlx/zero-cloud-dev-stack)*
