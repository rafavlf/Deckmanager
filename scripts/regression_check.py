#!/usr/bin/env python3
from pathlib import Path
import shutil, subprocess, sys
ROOT=Path(__file__).resolve().parents[1]
def run(label,cmd):
    print(f"\n=== {label} ===")
    subprocess.run(cmd,cwd=ROOT,check=True)
def main():
    run("Validacao de dados",[sys.executable,str(ROOT/"scripts"/"validate_data.py")])
    run("Build web",[sys.executable,str(ROOT/"scripts"/"build.py")])
    run("Testes Python",[sys.executable,"-m","unittest","discover","-s","tests","-v"])
    node=shutil.which("node")
    if node:
        js_files=sorted((ROOT/"web-src").rglob("*.js"))
        print(f"\n=== Sintaxe JavaScript ({len(js_files)} arquivos) ===")
        for f in js_files: subprocess.run([node,"--check",str(f)],cwd=ROOT,check=True)
        print("Sintaxe JavaScript: OK")
    else:
        print("\n[AVISO] Node nao encontrado; checagem de sintaxe ignorada.")
    print("\n=== REGRESSAO AUTOMATIZADA: OK ===")
    return 0
if __name__=="__main__": raise SystemExit(main())
