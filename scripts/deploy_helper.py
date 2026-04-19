#!/usr/bin/env python3
"""Full Ovula deployment script using pexpect for SSH."""

import pexpect
import sys
import time
import os

HOST = "fyp-22p9181@121.52.146.108"
PASSWORD = "123Pak123@"

def run_ssh(command, timeout=300, verbose=True):
    """Run a command on the remote server via SSH."""
    full_cmd = f'ssh -o StrictHostKeyChecking=no -o ConnectTimeout=15 {HOST} \'{command}\''
    if verbose:
        print(f"\n>>> {command}")
    child = pexpect.spawn('/bin/bash', ['-c', full_cmd], timeout=timeout, encoding='utf-8')
    idx = child.expect(['password:', pexpect.EOF, pexpect.TIMEOUT], timeout=20)
    if idx == 0:
        child.sendline(PASSWORD)
        child.expect(pexpect.EOF, timeout=timeout)
    output = child.before or ''
    child.close()
    result = output.strip()
    if verbose and result:
        print(result)
    return result

def scp_to_server(local_path, remote_path, timeout=3600):
    """SCP file or directory to server."""
    if os.path.isdir(local_path):
        cmd = f'scp -r -o StrictHostKeyChecking=no {local_path} {HOST}:{remote_path}'
    else:
        cmd = f'scp -o StrictHostKeyChecking=no {local_path} {HOST}:{remote_path}'
    print(f"\n[SCP] {local_path} -> {HOST}:{remote_path}")
    child = pexpect.spawn('/bin/bash', ['-c', cmd], timeout=timeout, encoding='utf-8')
    idx = child.expect(['password:', pexpect.EOF, pexpect.TIMEOUT], timeout=20)
    if idx == 0:
        child.sendline(PASSWORD)
        child.expect(pexpect.EOF, timeout=timeout)
    output = child.before or ''
    child.close()
    if output.strip():
        print(output.strip())
    return child.exitstatus == 0

def rsync_to_server(local_path, remote_path, excludes=None, timeout=3600):
    """rsync directory to server."""
    exclude_flags = ''
    if excludes:
        exclude_flags = ' '.join([f"--exclude='{e}'" for e in excludes])
    cmd = f"rsync -avz --progress -e 'ssh -o StrictHostKeyChecking=no' {exclude_flags} {local_path} {HOST}:{remote_path}"
    print(f"\n[RSYNC] {local_path} -> {HOST}:{remote_path}")
    child = pexpect.spawn('/bin/bash', ['-c', cmd], timeout=timeout, encoding='utf-8')
    idx = child.expect(['password:', pexpect.EOF, pexpect.TIMEOUT], timeout=20)
    if idx == 0:
        child.sendline(PASSWORD)
        child.expect(pexpect.EOF, timeout=timeout)
    output = child.before or ''
    child.close()
    if output.strip():
        print(output.strip()[-3000:])  # last 3000 chars
    return True

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 deploy_helper.py 'command'")
        sys.exit(1)
    result = run_ssh(sys.argv[1])
    print(result)
