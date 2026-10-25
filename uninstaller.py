# -*- coding: utf-8 -*-
"""
Деинсталлятор программы "Умный Огород".
Удаляет файлы программы, ярлыки на Рабочем столе и в меню Пуск,
а также запись из реестра Windows (Установка и удаление программ).
"""
import os
import sys
import shutil
import subprocess
import winreg
import tkinter as tk
from tkinter import ttk, messagebox

def get_install_dir():
    # If running from install directory
    if getattr(sys, 'frozen', False):
        exe_dir = os.path.dirname(sys.executable)
        # If running from temp extraction (pyinstaller onefile)
        if "smartgarden" in exe_dir.lower():
            return exe_dir
    local_app_data = os.environ.get('LOCALAPPDATA', os.path.expanduser('~'))
    return os.path.join(local_app_data, 'SmartGarden')

INSTALL_DIR = get_install_dir()
DATA_DIR = os.path.join(os.path.expanduser('~'), '.smartgarden_data')
DESKTOP_DIR = os.path.join(os.path.expanduser('~'), 'Desktop')
START_MENU_DIR = os.path.join(
    os.environ.get('APPDATA', os.path.expanduser('~')),
    'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Умный Огород'
)

def remove_registry_entry():
    try:
        winreg.DeleteKey(winreg.HKEY_CURRENT_USER, r"Software\Microsoft\Windows\CurrentVersion\Uninstall\SmartGarden")
    except Exception:
        pass

def kill_running_app():
    try:
        subprocess.run(["taskkill", "/f", "/im", "SmartGarden.exe"], capture_output=True)
    except Exception:
        pass
    try:
        subprocess.run(["taskkill", "/f", "/im", "Умный Огород.exe"], capture_output=True)
    except Exception:
        pass

def perform_uninstall(delete_user_data=False):
    # 1. Kill running instances
    kill_running_app()

    # 2. Delete Desktop shortcut
    desktop_lnk = os.path.join(DESKTOP_DIR, "Умный Огород.lnk")
    if os.path.exists(desktop_lnk):
        try:
            os.remove(desktop_lnk)
        except Exception:
            pass

    # 3. Delete Start Menu folder
    if os.path.exists(START_MENU_DIR):
        try:
            shutil.rmtree(START_MENU_DIR, ignore_errors=True)
        except Exception:
            pass

    # 4. Remove Windows Registry Uninstall key
    remove_registry_entry()

    # 5. Optionally remove user database
    if delete_user_data and os.path.exists(DATA_DIR):
        try:
            shutil.rmtree(DATA_DIR, ignore_errors=True)
        except Exception:
            pass

    # 6. Delete install directory via delayed cmd script (to allow uninstaller itself to close)
    if os.path.exists(INSTALL_DIR):
        try:
            cmd = f'ping 127.0.0.1 -n 2 > nul & rmdir /s /q "{INSTALL_DIR}"'
            subprocess.Popen(cmd, shell=True, creationflags=subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0)
        except Exception:
            pass

class UninstallerApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Удаление программы «Умный Огород»")
        self.root.geometry("500x320")
        self.root.resizable(False, False)

        # Center on screen
        self.root.update_idletasks()
        w = 500
        h = 320
        x = (self.root.winfo_screenwidth() // 2) - (w // 2)
        y = (self.root.winfo_screenheight() // 2) - (h // 2)
        self.root.geometry(f"{w}x{h}+{x}+{y}")

        self.root.configure(bg="#f8fafc")

        # Top banner
        banner = tk.Frame(root, bg="#166534", height=70)
        banner.pack(fill="x")
        banner.pack_propagate(False)

        title_lbl = tk.Label(
            banner, text="Удаление «Умный Огород»",
            font=("Segoe UI", 15, "bold"), fg="#ffffff", bg="#166534"
        )
        title_lbl.pack(anchor="w", padx=20, pady=(12, 0))

        sub_lbl = tk.Label(
            banner, text="Мастер деинсталляции и очистки системы",
            font=("Segoe UI", 9), fg="#bbf7d0", bg="#166534"
        )
        sub_lbl.pack(anchor="w", padx=20, pady=(2, 0))

        # Main content
        content = tk.Frame(root, bg="#f8fafc")
        content.pack(fill="both", expand=True, padx=25, pady=20)

        warn_lbl = tk.Label(
            content,
            text="Вы действительно хотите удалить программу «Умный Огород»\nс этого компьютера?",
            font=("Segoe UI", 10, "bold"), fg="#1e293b", bg="#f8fafc", justify="left"
        )
        warn_lbl.pack(anchor="w", pady=(0, 10))

        info_lbl = tk.Label(
            content,
            text=f"Будут удалены все файлы программы, ярлыки на Рабочем столе\nи в меню «Пуск» из папки:\n{INSTALL_DIR}",
            font=("Segoe UI", 8), fg="#64748b", bg="#f8fafc", justify="left"
        )
        info_lbl.pack(anchor="w", pady=(0, 15))

        self.del_data_var = tk.BooleanVar(value=False)
        self.chk_del_data = tk.Checkbutton(
            content,
            text="Также удалить мои грядки, историю посадок и базу данных",
            variable=self.del_data_var,
            font=("Segoe UI", 9), fg="#b91c1c", bg="#f8fafc",
            activebackground="#f8fafc", selectcolor="#ffffff"
        )
        self.chk_del_data.pack(anchor="w", pady=(0, 15))

        # Buttons frame
        btn_frame = tk.Frame(root, bg="#f1f5f9", height=50)
        btn_frame.pack(fill="x", side="bottom")
        btn_frame.pack_propagate(False)

        cancel_btn = tk.Button(
            btn_frame, text="Отмена", font=("Segoe UI", 9),
            bg="#ffffff", fg="#334155", relief="groove", bd=1,
            padx=15, pady=4, cursor="hand2", command=root.destroy
        )
        cancel_btn.pack(side="right", padx=(10, 20), pady=10)

        uninstall_btn = tk.Button(
            btn_frame, text="Удалить программу", font=("Segoe UI", 9, "bold"),
            bg="#dc2626", fg="#ffffff", activebackground="#b91c1c", activeforeground="#ffffff",
            relief="flat", padx=16, pady=4, cursor="hand2", command=self.do_uninstall
        )
        uninstall_btn.pack(side="right", pady=10)

    def do_uninstall(self):
        try:
            perform_uninstall(delete_user_data=self.del_data_var.get())
            messagebox.showinfo(
                "Удаление завершено",
                "Программа «Умный Огород» успешно удалена с вашего компьютера."
            )
        except Exception as e:
            messagebox.showwarning(
                "Удаление",
                f"Основные файлы удалены. Сообщение: {e}"
            )
        self.root.destroy()
        sys.exit(0)

if __name__ == '__main__':
    root = tk.Tk()
    app = UninstallerApp(root)
    root.mainloop()
