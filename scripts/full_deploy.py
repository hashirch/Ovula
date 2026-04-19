#!/usr/bin/env python3
"""
Full Ovula Deployment Script
Covers: nvm/Node install, rsync, backend setup, Ollama, models, screen sessions.
"""

import pexpect
import sys
import time
import os

HOST = "fyp-22p9181@121.52.146.108"
PASSWORD = "123Pak123@"
PROJECT_ROOT = "/home/hashir/Desktop/FYP/pcos-tracking-system"
REMOTE_DIR = "/home/fyp-22p9181/ovula"

BOLD  = "\033[1m"
GREEN = "\033[92m"
YELLOW= "\033[93m"
RED   = "\033[91m"
RESET = "\033[0m"

def banner(msg):
    print(f"\n{BOLD}{GREEN}{'='*60}{RESET}")
    print(f"{BOLD}{GREEN}  {msg}{RESET}")
    print(f"{BOLD}{GREEN}{'='*60}{RESET}\n")

def info(msg):
    print(f"{YELLOW}>>> {msg}{RESET}")

def ok(msg):
    print(f"{GREEN}✅ {msg}{RESET}")

def err(msg):
    print(f"{RED}❌ {msg}{RESET}")


def run_ssh(command, timeout=300, show_output=True):
    """Run a single command on the remote server via SSH with password auth."""
    full_cmd = f"ssh -o StrictHostKeyChecking=no -o ConnectTimeout=20 {HOST} '{command}'"
    if show_output:
        info(command[:120])
    child = pexpect.spawn('/bin/bash', ['-c', full_cmd], timeout=timeout, encoding='utf-8')
    idx = child.expect(['password:', pexpect.EOF, pexpect.TIMEOUT], timeout=25)
    if idx == 0:
        child.sendline(PASSWORD)
        child.expect(pexpect.EOF, timeout=timeout)
    output = (child.before or '').strip()
    child.close()
    if show_output and output:
        # Print last 2000 chars to avoid flooding
        print(output[-2000:])
    return output, child.exitstatus


def rsync_to_server(local_path, remote_path, excludes=None, timeout=3600):
    """rsync a local path to the remote server with password."""
    exclude_flags = ''
    if excludes:
        exclude_flags = ' '.join([f"--exclude='{e}'" for e in excludes])
    cmd = (f"rsync -avz --progress "
           f"-e 'ssh -o StrictHostKeyChecking=no' "
           f"{exclude_flags} {local_path} {HOST}:{remote_path}")
    info(f"rsync {local_path} → {HOST}:{remote_path}")
    child = pexpect.spawn('/bin/bash', ['-c', cmd], timeout=timeout, encoding='utf-8')
    idx = child.expect(['password:', pexpect.EOF, pexpect.TIMEOUT], timeout=30)
    if idx == 0:
        child.sendline(PASSWORD)
        child.expect(pexpect.EOF, timeout=timeout)
    output = (child.before or '').strip()
    child.close()
    if output:
        # Print last few lines
        lines = output.splitlines()
        for l in lines[-20:]:
            print(l)
    return child.exitstatus == 0


def scp_to_server(local_path, remote_path, timeout=3600):
    """SCP a file to the server."""
    if os.path.isdir(local_path):
        cmd = f"scp -r -o StrictHostKeyChecking=no {local_path} {HOST}:{remote_path}"
    else:
        cmd = f"scp -o StrictHostKeyChecking=no {local_path} {HOST}:{remote_path}"
    info(f"scp {local_path} → {HOST}:{remote_path}")
    child = pexpect.spawn('/bin/bash', ['-c', cmd], timeout=timeout, encoding='utf-8')
    idx = child.expect(['password:', pexpect.EOF, pexpect.TIMEOUT], timeout=30)
    if idx == 0:
        child.sendline(PASSWORD)
        child.expect(pexpect.EOF, timeout=timeout)
    output = (child.before or '').strip()
    child.close()
    if output:
        print(output[-1000:])
    return child.exitstatus == 0


# ─────────────────────────────────────────────
# PHASE 1 — Quick server connectivity check
# ─────────────────────────────────────────────
def phase1_check():
    banner("Phase 1 — Server Connectivity Check")
    out, _ = run_ssh("uname -a && python3 --version 2>&1 && echo SSH_OK")
    if "SSH_OK" in out:
        ok("SSH connection working")
    else:
        err("SSH failed — check credentials")
        sys.exit(1)


# ─────────────────────────────────────────────
# PHASE 2 — Install Node.js via nvm on server
# ─────────────────────────────────────────────
def phase2_install_node():
    banner("Phase 2 — Install Node.js via nvm")

    # Check if node already exists
    out, _ = run_ssh("source ~/.nvm/nvm.sh 2>/dev/null; node --version 2>/dev/null || echo NO_NODE")
    if "NO_NODE" not in out and "v" in out:
        ok(f"Node.js already installed: {out.strip()}")
        return

    info("Installing nvm...")
    run_ssh(
        "curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash",
        timeout=120
    )
    time.sleep(3)

    info("Installing Node.js LTS via nvm...")
    run_ssh(
        'export NVM_DIR="$HOME/.nvm" && source "$NVM_DIR/nvm.sh" && nvm install --lts && nvm use --lts && node --version',
        timeout=300
    )

    out, _ = run_ssh('export NVM_DIR="$HOME/.nvm" && source "$NVM_DIR/nvm.sh" && node --version')
    ok(f"Node.js installed: {out.strip()}")


# ─────────────────────────────────────────────
# PHASE 3 — rsync project files to server
# ─────────────────────────────────────────────
def phase3_transfer_files():
    banner("Phase 3 — Transfer Project Files")

    # Create remote directory
    run_ssh(f"mkdir -p {REMOTE_DIR}", show_output=False)

    excludes = [
        'node_modules',
        'venv',
        '__pycache__',
        '*.pyc',
        '.git',
        '*.gguf',          # 1.26GB — handled separately
        'pcos_tracker.db', # start fresh or transfer separately
        '.idea',
        '.vscode',
        'dist',
    ]

    ok_rsync = rsync_to_server(
        local_path=f"{PROJECT_ROOT}/",
        remote_path=REMOTE_DIR,
        excludes=excludes,
        timeout=3600
    )

    if ok_rsync:
        ok("Project files synced to server")
    else:
        err("rsync may have had issues — continuing anyway")

    # Transfer the ML pkl model
    info("Transferring ML pkl model file...")
    run_ssh(f"mkdir -p {REMOTE_DIR}/src/ml-models/models/saved", show_output=False)
    scp_to_server(
        f"{PROJECT_ROOT}/src/ml-models/models/saved/pcos_model.pkl",
        f"{REMOTE_DIR}/src/ml-models/models/saved/pcos_model.pkl"
    )
    ok("ML model transferred")

    # Transfer pcos_tracker.db if it exists locally
    db_path = f"{PROJECT_ROOT}/src/backend/pcos_tracker.db"
    if os.path.exists(db_path):
        info("Transferring existing database...")
        scp_to_server(db_path, f"{REMOTE_DIR}/src/backend/pcos_tracker.db")
        ok("Database transferred")
    else:
        info("No local database found — server will create a fresh one on first run")


# ─────────────────────────────────────────────
# PHASE 4 — Backend setup on server
# ─────────────────────────────────────────────
def phase4_backend_setup():
    banner("Phase 4 — Backend Setup")

    # Write production .env on server
    info("Writing production .env on server...")
    import secrets
    prod_secret = secrets.token_hex(32)

    env_content = f"""SECRET_KEY={prod_secret}
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_URL=sqlite:///./pcos_tracker.db

# Model Configuration
MODEL_TYPE=ollama_base

# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_BASE_MODEL=pcos-base
OLLAMA_FINETUNED_MODEL=pcos-llama3

# Chat Configuration
MAX_CHAT_HISTORY=50
MAX_RESPONSE_LENGTH=512

# ElevenLabs Configuration for Urdu TTS
ELEVENLABS_API_KEY=sk_56d3fe72432b98b12c193149944f70726fd4f6fa02aab8ff
ELEVENLABS_VOICE_ID=pNInz6obpgDQGcFmaJgB
ELEVENLABS_MODEL_ID=eleven_multilingual_v2

# Email/OTP Configuration
OTP_ENABLED=true
EMAIL_BACKEND=smtp
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=ovula2025@gmail.com
SMTP_PASSWORD=hnqzfgwfzfxsuton
FROM_EMAIL=ovula2025@gmail.com
APP_NAME=Ovula
APP_URL=http://121.52.146.108:3000
"""

    # Escape the env content for shell
    env_escaped = env_content.replace("'", "'\\''")
    run_ssh(f"cat > {REMOTE_DIR}/src/backend/.env << 'ENVEOF'\n{env_content}\nENVEOF", show_output=False)
    ok(".env written on server")

    # Install Python requirements
    info("Installing Python requirements (this may take a while)...")
    run_ssh(
        f"cd {REMOTE_DIR}/src/backend && pip3 install -r requirements.txt --break-system-packages 2>&1 | tail -20",
        timeout=600
    )
    ok("Python requirements installed")


# ─────────────────────────────────────────────
# PHASE 5 — Install Ollama and create models
# ─────────────────────────────────────────────
def phase5_ollama_setup():
    banner("Phase 5 — Ollama & LLM Setup")

    # Check if ollama already installed
    out, _ = run_ssh("which ollama 2>/dev/null || ls ~/bin/ollama 2>/dev/null || echo NO_OLLAMA")
    if "NO_OLLAMA" in out or not out.strip():
        info("Installing Ollama...")
        run_ssh(
            "curl -fsSL https://ollama.ai/install.sh | sh 2>&1 | tail -10",
            timeout=300
        )
        ok("Ollama installed")
    else:
        ok(f"Ollama already present: {out.strip()}")

    # Check if pcos-llama3 model already exists
    out, _ = run_ssh(
        "OLLAMA_MODELS=$HOME/.ollama/models $HOME/bin/ollama list 2>/dev/null || ollama list 2>/dev/null || echo OLLAMA_CHECK_FAILED",
        show_output=True
    )

    if "pcos-llama3" in out:
        ok("pcos-llama3 model already exists — skipping model setup")
        return

    # Check for the GGUF file on the server
    out_gguf, _ = run_ssh(
        f"ls -lh {REMOTE_DIR}/src/ml-models/*.gguf 2>/dev/null || echo NO_GGUF",
        show_output=False
    )

    if "NO_GGUF" in out_gguf:
        info("GGUF file not on server. Transferring 1.26GB GGUF model (this will take time)...")
        local_gguf = f"{PROJECT_ROOT}/src/ml-models/llama-3.2-1b-instruct.Q8_0.gguf"
        if os.path.exists(local_gguf):
            scp_to_server(local_gguf, f"{REMOTE_DIR}/src/ml-models/llama-3.2-1b-instruct.Q8_0.gguf")
            ok("GGUF model transferred")
        else:
            err("GGUF not found locally either! Will try pulling from Ollama hub instead.")
            run_ssh(
                "OLLAMA_MODELS=$HOME/.ollama/models $HOME/bin/ollama pull llama3.2:1b 2>&1 | tail -5",
                timeout=600
            )

    # Create PCOS models from Modelfiles
    info("Creating pcos-base model from Modelfile_Base_PCOS...")
    run_ssh(
        f"export OLLAMA_MODELS=$HOME/.ollama/models && "
        f"$HOME/bin/ollama serve &>/dev/null & sleep 5 && "
        f"$HOME/bin/ollama create pcos-base -f {REMOTE_DIR}/src/ml-models/Modelfile_Base_PCOS 2>&1 | tail -10",
        timeout=300
    )

    info("Creating pcos-llama3 model from Modelfile_PCOS...")
    run_ssh(
        f"$HOME/bin/ollama create pcos-llama3 -f {REMOTE_DIR}/src/ml-models/Modelfile_PCOS 2>&1 | tail -10",
        timeout=300
    )
    ok("Ollama models created")


# ─────────────────────────────────────────────
# PHASE 6 — Transfer production build + serve
# ─────────────────────────────────────────────
def phase6_frontend():
    banner("Phase 6 — Frontend Static Serve")

    # Install serve via npm
    info("Installing 'serve' npm package on server...")
    run_ssh(
        'export NVM_DIR="$HOME/.nvm" && source "$NVM_DIR/nvm.sh" && '
        'npm install -g serve 2>&1 | tail -5',
        timeout=180
    )
    ok("'serve' installed")


# ─────────────────────────────────────────────
# PHASE 7 — Copy startup script & launch all
# ─────────────────────────────────────────────
def phase7_start_services():
    banner("Phase 7 — Starting All Services in Screen Sessions")

    # Copy the startup script to server
    scp_to_server(
        f"{PROJECT_ROOT}/scripts/start_production.sh",
        f"{REMOTE_DIR}/scripts/start_production.sh"
    )

    run_ssh(f"chmod +x {REMOTE_DIR}/scripts/start_production.sh", show_output=False)

    # Kill any existing screen sessions first to be clean
    run_ssh("screen -S ollama -X quit 2>/dev/null; screen -S backend -X quit 2>/dev/null; screen -S frontend -X quit 2>/dev/null; sleep 1", show_output=False)

    # Run the startup script
    info("Running production startup script...")
    run_ssh(
        f"bash {REMOTE_DIR}/scripts/start_production.sh 2>&1",
        timeout=120
    )
    ok("Startup script executed")

    time.sleep(5)

    # Show screen sessions
    out, _ = run_ssh("screen -list")
    print(out)


# ─────────────────────────────────────────────
# PHASE 8 — Verification
# ─────────────────────────────────────────────
def phase8_verify():
    banner("Phase 8 — Verification")

    time.sleep(8)  # Give services time to start

    # Check backend health
    info("Checking backend health...")
    out, _ = run_ssh("curl -s http://localhost:8000/health 2>/dev/null || curl -s http://localhost:8000/ 2>/dev/null || echo BACKEND_NOT_READY")
    if "BACKEND_NOT_READY" in out:
        err("Backend not responding yet — check ~/backend.log")
        run_ssh("tail -30 ~/backend.log 2>/dev/null || echo 'No backend log yet'")
    else:
        ok(f"Backend responding: {out[:100]}")

    # Check Ollama
    info("Checking Ollama...")
    out, _ = run_ssh("curl -s http://localhost:11434/api/tags 2>/dev/null | python3 -c 'import sys,json; d=json.load(sys.stdin); [print(m[\"name\"]) for m in d.get(\"models\",[])]' 2>/dev/null || echo OLLAMA_NOT_READY")
    if "OLLAMA_NOT_READY" in out or not out.strip():
        err("Ollama not responding yet — check ~/ollama.log")
    else:
        ok(f"Ollama models available:\n{out}")

    # Check frontend
    info("Checking frontend...")
    out, _ = run_ssh("curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/ 2>/dev/null || echo FRONTEND_NOT_READY")
    if "200" in out or "301" in out:
        ok(f"Frontend responding (HTTP {out.strip()})")
    else:
        err(f"Frontend status: {out.strip()} — check ~/frontend.log")

    print()
    banner("Deployment Complete!")
    print(f"""
  {GREEN}Backend API:   http://121.52.146.108:8000{RESET}
  {GREEN}API Docs:      http://121.52.146.108:8000/docs{RESET}
  {GREEN}Web Frontend:  http://121.52.146.108:3000{RESET}

  Check logs:
    tail -f ~/backend.log
    tail -f ~/frontend.log
    tail -f ~/ollama.log

  Screen sessions:
    screen -r backend
    screen -r frontend
    screen -r ollama
""")


# ─────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────
if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Ovula Full Deployment")
    parser.add_argument("--phase", type=int, default=0,
                        help="Run a specific phase (1-8). 0=run all phases.")
    parser.add_argument("--skip-transfer", action="store_true",
                        help="Skip file transfer (Phase 3) if already done")
    parser.add_argument("--skip-gguf", action="store_true",
                        help="Skip GGUF transfer (assume model already on server)")
    args = parser.parse_args()

    phases = {
        1: phase1_check,
        2: phase2_install_node,
        3: phase3_transfer_files,
        4: phase4_backend_setup,
        5: phase5_ollama_setup,
        6: phase6_frontend,
        7: phase7_start_services,
        8: phase8_verify,
    }

    if args.phase != 0:
        phases[args.phase]()
    else:
        phase1_check()
        phase2_install_node()
        if not args.skip_transfer:
            phase3_transfer_files()
        phase4_backend_setup()
        phase5_ollama_setup()
        phase6_frontend()
        phase7_start_services()
        phase8_verify()
