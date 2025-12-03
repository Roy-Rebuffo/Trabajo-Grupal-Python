import webview
from M_users import Api

api = Api()
webview.create_window("ERP - Usuarios", "users_module.html", js_api=api)
webview.start()
