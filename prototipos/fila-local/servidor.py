"""Endpoint falso da sincronizacao. Roda com: python servidor.py

Serve a pagina e aceita POST /eventos. Deduplica pelo id gerado no
dispositivo — reenviar a mesma fila duas vezes nao duplica nada, que e
o contrato que a fila local exige do servidor de verdade.
"""
import json
import socket
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path

AQUI = Path(__file__).parent
ARQUIVO = AQUI / "eventos.jsonl"
vistos = {json.loads(l)["id"] for l in ARQUIVO.read_text().splitlines()} if ARQUIVO.exists() else set()


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=str(AQUI), **kw)

    def do_POST(self):
        if self.path != "/eventos":
            return self.send_error(404)
        eventos = json.loads(self.rfile.read(int(self.headers["Content-Length"])))
        with ARQUIVO.open("a", encoding="utf-8") as f:
            for e in eventos:
                if e["id"] not in vistos:
                    vistos.add(e["id"])
                    f.write(json.dumps(e, ensure_ascii=False) + "\n")
        # aceita tudo que chegou, inclusive repetido: para a fila, aceito = pode apagar
        corpo = json.dumps({"aceitos": [e["id"] for e in eventos]}).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", len(corpo))
        self.end_headers()
        self.wfile.write(corpo)


if __name__ == "__main__":
    ip = socket.gethostbyname(socket.gethostname())
    print(f"No celular, na mesma rede wi-fi:  http://{ip}:8765")
    print(f"Eventos recebidos vao para:       {ARQUIVO}")
    HTTPServer(("0.0.0.0", 8765), Handler).serve_forever()
