# -*- coding: utf-8 -*-
"""
Мастер установки (Installer) программы "Умный Огород".
Устанавливает приложение, создает ярлыки на Рабочем столе и в меню Пуск,
регистрирует программу в реестре Windows (в разделе "Установка и удаление программ")
и добавляет деинсталлятор для чистого удаления.
"""
import os
import sys
import shutil
import subprocess
import winreg
import threading
import time
import tkinter as tk
from tkinter import ttk, filedialog, messagebox

def get_bundle_dir():
    if getattr(sys, 'frozen', False):
        return sys._MEIPASS
    return os.path.dirname(os.path.abspath(__file__))

BUNDLE_DIR = get_bundle_dir()

def get_default_install_dir():
    local_app_data = os.environ.get('LOCALAPPDATA', os.path.expanduser('~'))
    return os.path.join(local_app_data, 'SmartGarden')

def create_shortcut_wscript(target, lnk_path, icon_path=None, description=""):
    """
    Creates Windows .lnk shortcut using standard Windows WScript.Shell
    """
    try:
        import win32com.client
        wscript = win32com.client.Dispatch("WScript.Shell")
        s = wscript.CreateShortcut(lnk_path)
        s.TargetPath = target
        s.WorkingDirectory = os.path.dirname(target)
        if icon_path and os.path.exists(icon_path):
            s.IconLocation = icon_path
        if description:
            s.Description = description
        s.Save()
        return True
    except Exception:
        pass

    # Fallback via VBS script (100% native on Windows)
    try:
        vbs_path = os.path.join(os.environ.get('TEMP', os.path.expanduser('~')), "create_lnk.vbs")
        with open(vbs_path, "w", encoding="cp1251") as f:
            f.write('Set oWS = WScript.CreateObject("WScript.Shell")\n')
            f.write(f'Set oLink = oWS.CreateShortcut("{lnk_path}")\n')
            f.write(f'oLink.TargetPath = "{target}"\n')
            f.write(f'oLink.WorkingDirectory = "{os.path.dirname(target)}"\n')
            if icon_path and os.path.exists(icon_path):
                f.write(f'oLink.IconLocation = "{icon_path}"\n')
            if description:
                f.write(f'oLink.Description = "{description}"\n')
            f.write('oLink.Save\n')
        subprocess.run(["cscript", "//nologo", vbs_path], capture_output=True)
        try:
            os.remove(vbs_path)
        except Exception:
            pass
        return os.path.exists(lnk_path)
    except Exception:
        return False

def register_in_windows_uninstall(install_dir):
    """
    Register in Windows Settings -> Apps / "Установка и удаление программ"
    """
    try:
        key_path = r"Software\Microsoft\Windows\CurrentVersion\Uninstall\SmartGarden"
        key = winreg.CreateKey(winreg.HKEY_CURRENT_USER, key_path)
        
        exe_path = os.path.join(install_dir, "SmartGarden.exe")
        icon_path = os.path.join(install_dir, "icon.ico")
        uninst_path = os.path.join(install_dir, "Uninstall.exe")

        winreg.SetValueEx(key, "DisplayName", 0, winreg.REG_SZ, "Умный Огород — Планировщик грядок и умный севооборот")
        winreg.SetValueEx(key, "DisplayVersion", 0, winreg.REG_SZ, "3.0")
        winreg.SetValueEx(key, "Publisher", 0, winreg.REG_SZ, "Мой Огород")
        winreg.SetValueEx(key, "DisplayIcon", 0, winreg.REG_SZ, icon_path if os.path.exists(icon_path) else exe_path)
        winreg.SetValueEx(key, "InstallLocation", 0, winreg.REG_SZ, install_dir)
        winreg.SetValueEx(key, "UninstallString", 0, winreg.REG_SZ, f'"{uninst_path}"')
        winreg.SetValueEx(key, "QuietUninstallString", 0, winreg.REG_SZ, f'"{uninst_path}" /quiet')
        winreg.SetValueEx(key, "NoModify", 0, winreg.REG_DWORD, 1)
        winreg.SetValueEx(key, "NoRepair", 0, winreg.REG_DWORD, 1)
        winreg.CloseKey(key)
    except Exception as e:
        print(f"Registry error: {e}")

class InstallerApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Установка «Умный Огород»")
        self.root.geometry("540x410")
        self.root.resizable(False, False)

        # Center on screen
        self.root.update_idletasks()
        w = 540
        h = 410
        x = (self.root.winfo_screenwidth() // 2) - (w // 2)
        y = (self.root.winfo_screenheight() // 2) - (h // 2)
        self.root.geometry(f"{w}x{h}+{x}+{y}")
        self.root.configure(bg="#f8fafc")

        # Top banner
        banner = tk.Frame(root, bg="#166534", height=75)
        banner.pack(fill="x")
        banner.pack_propagate(False)

        title_lbl = tk.Label(
            banner, text="Мастер установки «Умный Огород»",
            font=("Segoe UI", 14, "bold"), fg="#ffffff", bg="#166534"
        )
        title_lbl.pack(anchor="w", padx=20, pady=(12, 0))

        sub_lbl = tk.Label(
            banner, text="Планировщик посадок, грядок и умный севооборот на вашем компьютере",
            font=("Segoe UI", 9), fg="#bbf7d0", bg="#166534"
        )
        sub_lbl.pack(anchor="w", padx=20, pady=(2, 0))

        # Main content area
        self.content = tk.Frame(root, bg="#f8fafc")
        self.content.pack(fill="both", expand=True, padx=25, pady=15)

        # Folder selection
        folder_lbl = tk.Label(
            self.content, text="Папка для установки программы:",
            font=("Segoe UI", 9, "bold"), fg="#1e293b", bg="#f8fafc"
        )
        folder_lbl.pack(anchor="w", pady=(0, 5))

        f_frame = tk.Frame(self.content, bg="#f8fafc")
        f_frame.pack(fill="x", pady=(0, 15))

        self.path_var = tk.StringVar(value=get_default_install_dir())
        self.path_entry = tk.Entry(
            f_frame, textvariable=self.path_var, font=("Segoe UI", 9),
            relief="solid", bd=1
        )
        self.path_entry.pack(side="left", fill="x", expand=True, ipady=3)

        browse_btn = tk.Button(
            f_frame, text="Обзор...", font=("Segoe UI", 8),
            bg="#ffffff", relief="groove", bd=1, padx=10, command=self.browse_folder
        )
        browse_btn.pack(side="right", padx=(8, 0))

        # Options
        opt_lbl = tk.Label(
            self.content, text="Дополнительные действия:",
            font=("Segoe UI", 9, "bold"), fg="#1e293b", bg="#f8fafc"
        )
        opt_lbl.pack(anchor="w", pady=(0, 6))

        self.desktop_var = tk.BooleanVar(value=True)
        self.chk_desktop = tk.Checkbutton(
            self.content, text="Создать ярлык на Рабочем столе",
            variable=self.desktop_var, font=("Segoe UI", 9),
            bg="#f8fafc", activebackground="#f8fafc", selectcolor="#ffffff"
        )
        self.chk_desktop.pack(anchor="w", pady=2)

        self.startmenu_var = tk.BooleanVar(value=True)
        self.chk_startmenu = tk.Checkbutton(
            self.content, text="Создать пункт в меню «Пуск» (включая деинсталлятор)",
            variable=self.startmenu_var, font=("Segoe UI", 9),
            bg="#f8fafc", activebackground="#f8fafc", selectcolor="#ffffff"
        )
        self.chk_startmenu.pack(anchor="w", pady=2)

        self.launch_var = tk.BooleanVar(value=True)
        self.chk_launch = tk.Checkbutton(
            self.content, text="Запустить «Умный Огород» сразу после завершения",
            variable=self.launch_var, font=("Segoe UI", 9),
            bg="#f8fafc", activebackground="#f8fafc", selectcolor="#ffffff"
        )
        self.chk_launch.pack(anchor="w", pady=2)

        # Progress elements (hidden initially)
        self.status_lbl = tk.Label(
            self.content, text="", font=("Segoe UI", 9),
            fg="#166534", bg="#f8fafc"
        )
        self.progress = ttk.Progressbar(self.content, orient="horizontal", mode="determinate")

        # Bottom buttons bar
        btn_frame = tk.Frame(root, bg="#f1f5f9", height=50)
        btn_frame.pack(fill="x", side="bottom")
        btn_frame.pack_propagate(False)

        self.cancel_btn = tk.Button(
            btn_frame, text="Отмена", font=("Segoe UI", 9),
            bg="#ffffff", fg="#334155", relief="groove", bd=1,
            padx=15, pady=4, cursor="hand2", command=root.destroy
        )
        self.cancel_btn.pack(side="right", padx=(10, 20), pady=10)

        self.install_btn = tk.Button(
            btn_frame, text="Установить", font=("Segoe UI", 9, "bold"),
            bg="#16a34a", fg="#ffffff", activebackground="#15803d", activeforeground="#ffffff",
            relief="flat", padx=18, pady=4, cursor="hand2", command=self.start_install
        )
        self.install_btn.pack(side="right", pady=10)

    def browse_folder(self):
        folder = filedialog.askdirectory(initialdir=self.path_var.get())
        if folder:
            self.path_var.set(os.path.join(folder, "SmartGarden"))

    def start_install(self):
        self.install_btn.config(state="disabled")
        self.cancel_btn.config(state="disabled")
        self.path_entry.config(state="disabled")
        self.chk_desktop.config(state="disabled")
        self.chk_startmenu.config(state="disabled")
        self.chk_launch.config(state="disabled")

        self.status_lbl.pack(anchor="w", pady=(15, 5))
        self.progress.pack(fill="x", pady=(0, 5))

        threading.Thread(target=self.run_installation, daemon=True).start()

    def run_installation(self):
        target_dir = self.path_var.get().strip()
        os.makedirs(target_dir, exist_ok=True)

        self.update_status("Копирование файлов программы...", 20)
        time.sleep(0.3)

        files_to_copy = ["SmartGarden.exe", "Uninstall.exe", "icon.ico", "icon.png", "ИНСТРУКЦИЯ_ПОЛЬЗОВАТЕЛЯ.md", "README.md"]
        for fname in files_to_copy:
            src = os.path.join(BUNDLE_DIR, fname)
            if not os.path.exists(src):
                # Fallback to current working dir
                src = os.path.join(os.path.dirname(os.path.abspath(__file__)), fname)
            if os.path.exists(src):
                dst = os.path.join(target_dir, fname)
                shutil.copy2(src, dst)

        self.update_status("Настройка ярлыков и меню...", 60)
        time.sleep(0.3)

        exe_path = os.path.join(target_dir, "SmartGarden.exe")
        icon_path = os.path.join(target_dir, "icon.ico")
        uninst_path = os.path.join(target_dir, "Uninstall.exe")
        manual_path = os.path.join(target_dir, "ИНСТРУКЦИЯ_ПОЛЬЗОВАТЕЛЯ.md")

        # Desktop shortcut
        if self.desktop_var.get():
            desktop_lnk = os.path.join(os.path.expanduser('~'), 'Desktop', 'Умный Огород.lnk')
            create_shortcut_wscript(
                exe_path, desktop_lnk, icon_path, "Планировщик грядок и умный севооборот"
            )

        # Start Menu folder
        if self.startmenu_var.get():
            sm_dir = os.path.join(
                os.environ.get('APPDATA', os.path.expanduser('~')),
                'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Умный Огород'
            )
            os.makedirs(sm_dir, exist_ok=True)
            create_shortcut_wscript(
                exe_path, os.path.join(sm_dir, "Умный Огород.lnk"),
                icon_path, "Планировщик грядок и умный севооборот"
            )
            if os.path.exists(manual_path):
                create_shortcut_wscript(
                    manual_path, os.path.join(sm_dir, "Инструкция пользователя.lnk"),
                    icon_path, "Руководство пользователя программы"
                )
            create_shortcut_wscript(
                uninst_path, os.path.join(sm_dir, "Удалить Умный Огород.lnk"),
                None, "Удаление программы с компьютера"
            )

        self.update_status("Регистрация в Windows (Установка и удаление программ)...", 85)
        register_in_windows_uninstall(target_dir)
        time.sleep(0.3)

        self.update_status("Установка успешно завершена!", 100)
        time.sleep(0.4)

        self.root.after(0, self.finish_screen, target_dir)

    def update_status(self, text, pct):
        self.root.after(0, lambda: self._set_status(text, pct))

    def _set_status(self, text, pct):
        self.status_lbl.config(text=text)
        self.progress['value'] = pct

    def finish_screen(self, target_dir):
        # Change button to "Готово"
        self.install_btn.config(
            text="Готово", state="normal", bg="#166534",
            command=lambda: self.on_finish(target_dir)
        )
        messagebox.showinfo(
            "Установка завершена",
            f"Программа «Умный Огород» успешно установлена!\n\n"
            f"Папка программы: {target_dir}\n"
            f"Ярлык для запуска создан на Рабочем столе.\n"
            f"Для удаления программы используйте значок 'Удалить Умный Огород' в меню Пуск или 'Параметры Windows -> Приложения'."
        )
        if self.launch_var.get():
            exe_path = os.path.join(target_dir, "SmartGarden.exe")
            if os.path.exists(exe_path):
                subprocess.Popen([exe_path])
        self.root.destroy()
        sys.exit(0)

    def on_finish(self, target_dir):
        if self.launch_var.get():
            exe_path = os.path.join(target_dir, "SmartGarden.exe")
            if os.path.exists(exe_path):
                subprocess.Popen([exe_path])
        self.root.destroy()
        sys.exit(0)

if __name__ == '__main__':
    root = tk.Tk()
    app = InstallerApp(root)
    root.mainloop()
