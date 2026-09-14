import http.server
import socketserver
import os

PORT = 3000
DIRECTORY = os.path.abspath("dist")

class SPAHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        full_path = self.translate_path(self.path)
        if not os.path.exists(full_path) or os.path.isdir(full_path):
            self.path = "/index.html"
        return super().do_GET()

socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("", PORT), SPAHandler) as httpd:
    print(f"SPA Server listening on {PORT}")
    httpd.serve_forever()
