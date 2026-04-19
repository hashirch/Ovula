#!/usr/bin/env python3
"""SSH deployment helper using pexpect."""

import pexpect
import sys
import time

HOST = "fyp-22p9181@121.52.146.108"
PASSWORD = "123Pak123@"

def run_ssh(command, timeout=120, verbose=True):
    """Run a command on the remote server via SSH."""
    full_cmd = f'ssh -o StrictHostKeyChecking=no -o ConnectTimeout=15 {HOST} "{command}"'
    if verbose:
        print(f"\n[SSH] {command}")
    child = pexpect.spawn(full_cmd, timeout=timeout, encoding='utf-8')
    idx = child.expect([pexpect.EOF, 'password:', pexpect.TIMEOUT], timeout=20)
    if idx == 1:
        child.sendline(PASSWORD)
        child.expect(pexpect.EOF, timeout=timeout)
    output = child.before
    child.close()
    if verbose and output:
        print(output.strip())
    return output.strip() if output else ""

def run_ssh_interactive(commands, timeout=60):
    """Run multiple commands in one SSH session."""
    combined = " && ".join(commands)
    return run_ssh(combined, timeout=timeout)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 ssh_deploy.py 'command'")
        sys.exit(1)
    result = run_ssh(sys.argv[1])
    print(result)
