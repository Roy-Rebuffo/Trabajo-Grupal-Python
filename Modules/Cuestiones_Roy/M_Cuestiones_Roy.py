from Modules.customers.M_Customers import M_Customers
from Modules.Facturas.M_Facturas import M_Facturas
from Modules.products.M_Products import M_Products
from Modules.services.M_Services import M_Services
from Modules.usuarios.M_users import M_users 
import sys
import os

class M_Cuestiones_Roy:
    def __init__(self):
        self.m_customers = M_Customers()
        self.m_facturas = M_Facturas()
        self.m_productos = M_Products()
        self.m_services = M_Services()
        self.m_usuarios = M_users() 

        # ------------------------------------------------------------------
        # --- Carga y CONVERSIÓN de LISTA a DICCIONARIO por ID (SOLUCIÓN al AttributeError) ---
        # ------------------------------------------------------------------
        
        # 1. CLIENTES (Asumo clave 'id_cliente')
        clientes_lista = self.m_customers.GetCustomers() 
        self.clientes = {
            str(c.get('id_cliente')): c 
            for c in clientes_lista 
            if isinstance(c, dict) and c.get('id_cliente') is not None
        }
        
        # 2. PRODUCTOS 
        # Asumo que GetProducts() ya devuelve diccionario { 'PR-0001': {...} }
        self.productos = self.m_productos.GetProducts() 
        
        # 3. SERVICIOS (CORRECCIÓN: Asumo que getServices() devuelve el DICCIONARIO { 'S1': {...} })
        # Si getServices() devuelve el diccionario, lo asignamos directamente, 
        # ya que la conversión manual estaba buscando una clave incorrecta ('id_servicio').
        self.servicios = self.m_services.getServices()
        
        # 4. USUARIOS (Clave 'id_usuario')
        usuarios_lista = self.m_usuarios.cargar_usuarios()
        self.usuarios = {
            str(u.get('id_usuario')): u 
            for u in usuarios_lista 
            if isinstance(u, dict) and u.get('id_usuario') is not None
        }
        
        # ------------------------------------------------------------------


    # Función auxiliar para obtener nombre completo de cliente
    def nombre_completo_cliente(self, cid):
        cliente = self.clientes.get(cid)
        if cliente:
            # Reviso si las claves son 'name' y 'surname' o 'nombre' y 'apellido'
            name = cliente.get('name', cliente.get('nombre', ''))
            surname = cliente.get('surname', cliente.get('apellido', ''))
            return f"{name} {surname}"
        return f"Cliente Desconocido ({cid})"

    # Función auxiliar para obtener nombre completo de empleado/usuario
    def nombre_completo_usuario(self, uid):
        usuario = self.usuarios.get(uid)
        if usuario:
            # Asumo que los usuarios tienen 'nombre' y 'apellido' (por tu M_users.py)
            return f"{usuario.get('nombre', '')} {usuario.get('apellido', '')}"
        return f"Empleado Desconocido ({uid})"

    # Función auxiliar para obtener nombre de producto
    def nombre_producto(self, pid):
        producto = self.productos.get(pid)
        return producto.get('name', "Producto Desconocido") if producto else "Producto Desconocido"

    # Función auxiliar para obtener nombre de servicio
    def nombre_servicio(self, sid):
        servicio = self.servicios.get(sid)
        return servicio.get('name', "Servicio Desconocido") if servicio else "Servicio Desconocido"

    # -----------------------------
    # 8. Ranking de productos con mayor facturación
    # -----------------------------
    def ranking_productos_por_facturacion(self, limit=10):
        facturas = self.m_facturas.obtener_facturas()
        facturacion_por_producto = {}

        for factura in facturas.values():
            for linea in factura["lineas"]:
                if linea["tipo"] == "producto":
                    pid = linea["id_referencia"]
                    facturacion_linea = linea["cantidad"] * linea["precio_unitario"]
                    facturacion_por_producto[pid] = facturacion_por_producto.get(pid, 0) + facturacion_linea

        ranking = sorted(facturacion_por_producto.items(), key=lambda x: x[1], reverse=True)
        return [(pid, self.nombre_producto(pid), facturacion) for pid, facturacion in ranking[:limit]]

    # -----------------------------
    # 9. Servicios más vendidos por empleado (Simplificado a 'empleado_id' si falla el nombre)
    # -----------------------------
    def servicios_vendidos_por_empleado(self):
        facturas = self.m_facturas.obtener_facturas()
        ventas_por_empleado = {}

        for factura in facturas.values():
            # Nota: Asumo que 'empleado_id' es una clave de string, como requiere el diccionario self.usuarios
            uid = str(factura["empleado_id"]) 
            ventas_por_empleado.setdefault(uid, {})
            
            for linea in factura["lineas"]:
                if linea["tipo"] == "servicio":
                    sid = linea["id_referencia"]
                    cantidad = linea["cantidad"]
                    
                    ventas_por_empleado[uid].setdefault(sid, 0)
                    ventas_por_empleado[uid][sid] += cantidad

        resultados = {}
        for uid, servicios_vendidos in ventas_por_empleado.items():
            # Intentamos obtener el nombre completo. Si falla, usamos el ID directamente.
            nombre_empleado = self.nombre_completo_usuario(uid) 
            
            ranking_servicios = sorted(servicios_vendidos.items(), key=lambda x: x[1], reverse=True)
            resultados[nombre_empleado] = [(self.nombre_servicio(sid), cantidad) for sid, cantidad in ranking_servicios]
        
        return resultados

    # -----------------------------
    # 10. Relación entre stock vendido y reposición necesaria
    # -----------------------------
    def stock_vendido_y_reposicion(self):
        facturas = self.m_facturas.obtener_facturas()
        stock_vendido = {}

        for factura in facturas.values():
            for linea in factura["lineas"]:
                if linea["tipo"] == "producto":
                    pid = linea["id_referencia"]
                    cantidad = linea["cantidad"]
                    stock_vendido[pid] = stock_vendido.get(pid, 0) + cantidad
        
        resultados = {}
        for pid, producto in self.productos.items():
            nombre = producto["name"]
            stock_actual = producto["stock"]
            vendido = stock_vendido.get(pid, 0)
            
            reposicion_sugerida = vendido if stock_actual < vendido else 0 

            resultados[pid] = {
                "nombre": nombre,
                "stock_actual": stock_actual,
                "cantidad_vendida": vendido,
                "reposicion_sugerida": reposicion_sugerida
            }

        return resultados
    
    # -----------------------------
    # 11. Comparativa productos vs servicios en un periodo (base imponible)
    # -----------------------------
    def comparativa_productos_vs_servicios(self, fecha_inicio=None, fecha_fin=None):
        facturas = self.m_facturas.obtener_facturas()
        totales = {"productos": 0, "servicios": 0}

        for factura in facturas.values():
            fecha_factura = factura["fecha"]

            if fecha_inicio and fecha_factura < fecha_inicio:
                continue
            if fecha_fin and fecha_factura > fecha_fin:
                continue

            for linea in factura["lineas"]:
                facturacion_linea = linea["cantidad"] * linea["precio_unitario"]
                
                if linea["tipo"] == "producto":
                    totales["productos"] += facturacion_linea
                elif linea["tipo"] == "servicio":
                    totales["servicios"] += facturacion_linea

        return totales

    # -----------------------------
    # 12. Producto más vendido según ciudad del cliente (Utiliza .get() para evitar KeyErrors)
    # -----------------------------
    def producto_mas_vendido_por_ciudad(self):
        facturas = self.m_facturas.obtener_facturas()
        conteo_por_ciudad = {}

        for factura in facturas.values():
            cid_factura = factura.get("cliente_id")
        
            # 🎯 CORRECCIÓN CLAVE: Intentar estandarizar el ID al formato 'IDx' si viene como número 'x'
            if isinstance(cid_factura, (int, float)) and self.clientes.get(f"ID{int(cid_factura)}"):
                cid = f"ID{int(cid_factura)}"
            # Si no es un número o si ya viene en el formato correcto (ej: "ID1"), lo usamos tal cual
            elif cid_factura is not None:
                cid = str(cid_factura)
            else:
                continue # Si no hay ID, saltamos

            # Buscamos el cliente y usamos .get() de forma segura
            cliente = self.clientes.get(cid)
        
            if not cliente:
                # Si el cliente no existe o no se cargó, saltamos esta factura
                continue 

            ciudad = cliente.get("city", "Ciudad Desconocida") # Usamos .get() de diccionario
        
            conteo_por_ciudad.setdefault(ciudad, {})

            for linea in factura["lineas"]:
                if linea["tipo"] == "producto":
                    pid = linea["id_referencia"]
                    cantidad = linea["cantidad"]
                    conteo_por_ciudad[ciudad].setdefault(pid, 0)
                    conteo_por_ciudad[ciudad][pid] += cantidad

        resultados = {}
        for ciudad, conteo in conteo_por_ciudad.items():
            if conteo:
                pid_mas_vendido = max(conteo, key=conteo.get)
                cantidad_mas_vendida = conteo[pid_mas_vendido]
            
                resultados[ciudad] = {
                    "producto_id": pid_mas_vendido,
                    "nombre_producto": self.nombre_producto(pid_mas_vendido),
                    "cantidad": cantidad_mas_vendida
                }
            else:
                resultados[ciudad] = None
                
        return resultados

    # -----------------------------
    # 13. Servicios con más duración total acumulada
    # -----------------------------
    def servicios_por_duracion_acumulada(self, limit=10):
        facturas = self.m_facturas.obtener_facturas()
        duracion_acumulada = {}

        for factura in facturas.values():
            for linea in factura["lineas"]:
                if linea["tipo"] == "servicio":
                    sid = linea["id_referencia"]
                    cantidad = linea["cantidad"]
                    
                    # CORRECCIÓN: self.servicios.get(sid, {}) ya devolverá el diccionario completo 
                    # si sid existe.
                    duracion_unit = self.servicios.get(sid, {}).get("duration_minutes", 0)
                    
                    duracion_linea = cantidad * duracion_unit
                    duracion_acumulada[sid] = duracion_acumulada.get(sid, 0) + duracion_linea

        ranking = sorted(duracion_acumulada.items(), key=lambda x: x[1], reverse=True)
        
        return [(sid, self.nombre_servicio(sid), duracion_minutos) for sid, duracion_minutos in ranking[:limit]]

    # -----------------------------
    # 14. Margen estimado por tipo de producto/servicio
    # -----------------------------
    def margen_estimado_por_tipo(self):
        facturas = self.m_facturas.obtener_facturas()
        margen_total = {"productos": 0, "servicios": 0}
        
        COSTO_ASUMIDO_PORCENTAJE = 0.5 

        for factura in facturas.values():
            for linea in factura["lineas"]:
                
                precio_unitario = linea["precio_unitario"]
                cantidad = linea["cantidad"]
                
                costo_unitario_ficticio = precio_unitario * COSTO_ASUMIDO_PORCENTAJE
                
                margen_linea = (precio_unitario - costo_unitario_ficticio) * cantidad
                
                if linea["tipo"] == "producto":
                    margen_total["productos"] += margen_linea
                elif linea["tipo"] == "servicio":
                    margen_total["servicios"] += margen_linea

        return margen_total

    # -----------------------------
    # Ejecutar todas las estadísticas del Grupo 2
    # -----------------------------
    def ejecutar_grupo_2(self):
        # Solución para que el módulo funcione independientemente:
        # Esto solo es necesario si se ejecuta el archivo M_Cuestiones_Roy.py directamente
        # y no a través de app.py
        if 'Modules' in sys.modules:
             print("Ejecutando desde la raíz del proyecto (app.py)")
        else:
             print("Ejecutando módulo de forma independiente (puede fallar si faltan datos)")

        print("8) Ranking de productos con mayor facturación:")
        print(self.ranking_productos_por_facturacion())

        print("\n9) Servicios más vendidos por empleado:")
        print(self.servicios_vendidos_por_empleado())

        print("\n10) Relación entre stock vendido y reposición necesaria:")
        print(self.stock_vendido_y_reposicion())

        print("\n11) Comparativa productos vs servicios (facturación base):")
        print(self.comparativa_productos_vs_servicios(fecha_inicio="2025-01-01", fecha_fin="2025-12-31"))

        print("\n12) Producto más vendido según ciudad del cliente:")
        print(self.producto_mas_vendido_por_ciudad())

        print("\n13) Servicios con más duración total acumulada (minutos):")
        print(self.servicios_por_duracion_acumulada())

        print("\n14) Margen estimado por tipo de producto/servicio (Costo 50% asumido):")
        print(self.margen_estimado_por_tipo())


if __name__ == "__main__":
    # Añadir el directorio raíz al path para que funcionen las importaciones relativas
    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
    
    mc = M_Cuestiones_Roy()
    mc.ejecutar_grupo_2()