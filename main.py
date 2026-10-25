# -*- coding: utf-8 -*-
"""
Умный Огород — Автономное настольное приложение (Desktop Application).
Запускает локальный сервер и отображает приложение в отдельном окне.
Все данные сохраняются локально в базе данных пользователя.
"""
import os
import sys
import socket
import threading
import time
import subprocess
import urllib.request
import webbrowser
import http.server

PRIMARY_PORT = 8765

def get_base_dir():
    if getattr(sys, 'frozen', False):
        candidates = [
            getattr(sys, '_MEIPASS', None),
            os.path.dirname(sys.executable),
            os.path.join(os.path.dirname(sys.executable), '_internal')
        ]
        for c in candidates:
            if c and os.path.exists(os.path.join(c, 'index.html')):
                return c
        if hasattr(sys, '_MEIPASS'):
            return sys._MEIPASS
        return os.path.dirname(sys.executable)
    return os.path.dirname(os.path.abspath(__file__))

BASE_DIR = get_base_dir()

class GardenHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def do_GET(self):
        if self.path == '/api/ping':
            self.send_response(200)
            self.send_header('Content-Type', 'text/plain')
            self.end_headers()
            self.wfile.write(b'pong')
            return
        elif self.path == '/api/shutdown':
            self.send_response(200)
            self.send_header('Content-Type', 'text/plain')
            self.end_headers()
            self.wfile.write(b'shutting down')
            def delayed_exit():
                time.sleep(0.5)
                os._exit(0)
            threading.Thread(target=delayed_exit, daemon=True).start()
            return
        super().do_GET()

    def end_headers(self):
        # Prevent aggressive asset caching so updates are always fresh
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def log_message(self, format, *args):
        # Suppress noisy HTTP logs in console/windowed mode
        pass

def is_port_in_use(port):
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(0.5)
            return s.connect_ex(('127.0.0.1', port)) == 0
    except Exception:
        return False

def find_available_port(start_port=8765):
    try:
        if is_port_in_use(start_port):
            try:
                # Check if it is already our garden server
                req = urllib.request.Request(f'http://127.0.0.1:{start_port}/index.html')
                with urllib.request.urlopen(req, timeout=0.6) as resp:
                    if resp.status == 200:
                        return start_port, True
            except Exception:
                pass

            # If occupied by another program, find next free port
            for p in range(start_port + 1, start_port + 50):
                if not is_port_in_use(p):
                    return p, False
        return start_port, False
    except Exception as e:
        log_debug(f"find_available_port exception: {e}")
        return start_port, False

def start_server(port):
    server = http.server.ThreadingHTTPServer(('127.0.0.1', port), GardenHTTPRequestHandler)
    server_thread = threading.Thread(target=server.serve_forever, daemon=True)
    server_thread.start()
    return server

def open_in_edge_app(url):
    """
    Launch Microsoft Edge in dedicated standalone desktop app mode
    (no address bar, no tabs - feels like native application).
    Edge is built into 100% of Windows 10 and 11 installations.
    """
    edge_paths = [
        os.path.expandvars(r"%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"),
        os.path.expandvars(r"%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"),
        os.path.expandvars(r"%LocalAppData%\Microsoft\Edge\Application\msedge.exe"),
    ]
    for path in edge_paths:
        if os.path.exists(path):
            try:
                proc = subprocess.Popen([
                    path,
                    f"--app={url}",
                    "--window-size=1440,920",
                    "--disable-extensions"
                ])
                return proc
            except Exception:
                pass
    return None

def log_debug(msg):
    try:
        log_path = os.path.join(os.path.expanduser("~"), "smart_garden_debug.log")
        with open(log_path, "a", encoding="utf-8") as f:
            f.write(f"{time.strftime('%Y-%m-%d %H:%M:%S')} - {msg}\n")
    except Exception:
        pass

def log_uncaught_exception(exctype, value, tb):
    import traceback
    log_debug(f"CRITICAL UNCAUGHT EXCEPTION: {exctype.__name__}: {value}\n{''.join(traceback.format_tb(tb))}")

sys.excepthook = log_uncaught_exception

if hasattr(threading, 'excepthook'):
    def log_thread_exception(args):
        log_debug(f"THREAD EXCEPTION: {args.exc_type}: {args.exc_value}")
    threading.excepthook = log_thread_exception

def main():
    log_debug("Starting SmartGarden application...")
    port, already_running = find_available_port(PRIMARY_PORT)
    url = f"http://127.0.0.1:{port}/index.html"
    log_debug(f"Target URL: {url}, already_running={already_running}, base_dir={BASE_DIR}")

    if not already_running:
        start_server(port)
        time.sleep(0.3)
        log_debug(f"Server started on port {port}")

    # Persistent user data directory for WebView2 localStorage
    user_data_dir = os.path.join(os.path.expanduser("~"), ".smartgarden_data")
    try:
        os.makedirs(user_data_dir, exist_ok=True)
    except Exception:
        pass

    # 1. Attempt to launch native WebView2 window via pywebview
    try:
        log_debug("Attempting to import and start pywebview...")
        import webview
        icon_file = os.path.join(BASE_DIR, "icon.ico")
        if not os.path.exists(icon_file):
            icon_file = None

        window = webview.create_window(
            title="Умный Огород — Планировщик грядок и умный севооборот",
            url=url,
            width=1440,
            height=920,
            min_size=(1024, 680),
            text_select=True,
            zoomable=True
        )
        log_debug(f"pywebview window created, starting loop with storage_path={user_data_dir}...")
        webview.start(private_mode=False, storage_path=user_data_dir, icon=icon_file)
        log_debug("pywebview window closed by user. Exiting.")
        sys.exit(0)
    except Exception as e:
        import traceback
        log_debug(f"pywebview failed: {e}\n{traceback.format_exc()}")

    # 2. Fallback: Edge App Mode (native app feel, identical rendering)
    log_debug("Falling back to Edge App Mode...")
    edge_proc = open_in_edge_app(url)
    if edge_proc:
        log_debug("Edge App launched. Keeping server alive...")
        try:
            while True:
                time.sleep(5)
        except KeyboardInterrupt:
            pass
        sys.exit(0)

    # 3. Universal Fallback: Default system browser
    log_debug("Falling back to default browser...")
    webbrowser.open(url)
    try:
        while True:
            time.sleep(5)
    except KeyboardInterrupt:
        sys.exit(0)

if __name__ == '__main__':
    import multiprocessing
    multiprocessing.freeze_support()
    try:
        main()
    except Exception as e:
        import traceback
        log_debug(f"TOP-LEVEL UNCAUGHT EXCEPTION: {e}\n{traceback.format_exc()}")
