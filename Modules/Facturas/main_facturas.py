import webview
from M_Facturas import Api

# Rutas relativas (suponiendo que ejecutas desde la raíz del proyecto)

ruta_clientes = "./Data/clientes.json"
ruta_productos = "./Data/productos.json"

# Instancia de la API
api = Api(ruta_clientes, ruta_productos)

# Crear ventana Webview
window = webview.create_window("Generador de Facturas", "./facturas.html", js_api=api)
webview.start(debug=True, http_server=False, gui='edgechromium')