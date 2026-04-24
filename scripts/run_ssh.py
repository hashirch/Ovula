import pty
import os
import sys

def main():
    host = sys.argv[1]
    password = sys.argv[2]
    cmd = sys.argv[3:]

    pid, fd = pty.fork()
    if pid == 0:
        os.execvp("ssh", ["ssh", "-o", "StrictHostKeyChecking=no", host] + cmd)
    else:
        output = b""
        import select
        while True:
            try:
                r, w, e = select.select([fd], [], [])
                if fd in r:
                    data = os.read(fd, 1024)
                    if not data:
                        break
                    output += data
                    if b"password:" in data.lower():
                        os.write(fd, password.encode() + b"\n")
            except Exception as e:
                break
        print(output.decode("utf-8", errors="replace"))

if __name__ == "__main__":
    main()
