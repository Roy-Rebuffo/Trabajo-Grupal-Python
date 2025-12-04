# M_cuestiones_Rafael.py

from Modules.usuarios.M_users import M_users
from Modules.Facturas.M_Facturas import M_Facturas
from Modules.products.M_Products import M_Products
from Modules.services.M_Services import M_Services
from Modules.customers.M_Customers import M_Customers

class M_cuestiones_Rafael:
    def __init__(self):
        self.m_usuarios = M_users()
        self.m_facturas = M_Facturas()
        self.m_productos = M_Products()
        self.m_services = M_Services()
        self.m_customers = M_Customers()

        usuarios_lista = self.m_usuarios.cargar_usuarios()
        self.usuarios = {
            str(u.get('id_usuario')): u 
            for u in usuarios_lista 
            if isinstance(u, dict) and u.get('id_usuario') is not None
        }

        self.empleados = self.usuarios
        
        clientes_lista = self.m_customers.GetCustomers() 
        self.clientes = {
            str(c.get('id_cliente')): c 
            for c in clientes_lista 
            if isinstance(c, dict) and c.get('id_cliente') is not None
        }

        self.productos = self.m_productos.GetProducts()
        servicios_lista = self.m_services.getServices()
        self.servicios = {
            str(s.get('id_servicio')): s 
            for s in servicios_lista 
            if isinstance(s, dict) and s.get('id_servicio') is not None
        }

        # 4. USUARIOS (Clave 'id_usuario' - ESTO SOLUCIONA EL ERROR LIST VS DICT)
        usuarios_lista = self.m_usuarios.cargar_usuarios()
        self.usuarios = {
            str(u.get('id_usuario')): u 
            for u in usuarios_lista 
            if isinstance(u, dict) and u.get('id_usuario') is not None
        }

    # Función auxiliar para obtener nombre completo del empleado
    def nombre_completo_empleado(self, uid):
        empleado = self.empleados.get(uid)
        if empleado:
            return f"{empleado['name']} {empleado['surname']}"
        return "Desconocido"

    # 1) Facturación generada por empleado
    def facturacion_por_empleado(self):
        facturas = self.m_facturas.obtener_facturas()
        total_por_empleado = {}

        for fid, factura in facturas.items():
            eid = factura["empleado_id"]
            total = factura["totales"]["total"]
            total_por_empleado[eid] = total_por_empleado.get(eid, 0) + total

        # Devolver lista de tuplas (id, nombre, total)
        return [(eid, self.nombre_completo_empleado(eid), total) for eid, total in total_por_empleado.items()]

    # 2) Tiempo total de servicios realizados por empleado
    def tiempo_total_servicios(self):
        facturas = self.m_facturas.obtener_facturas()
        tiempo_por_empleado = {}

        for fid, factura in facturas.items():
            eid = factura["empleado_id"]
            for linea in factura["lineas"]:
                if linea["tipo"] == "servicio":
                    servicio = self.m_services.getServiceByID(linea["id_referencia"])
                    if servicio:
                        tiempo_por_empleado[eid] = tiempo_por_empleado.get(eid, 0) + servicio["duration_minutes"] * linea["cantidad"]

        return [(eid, self.nombre_completo_empleado(eid), tiempo) for eid, tiempo in tiempo_por_empleado.items()]

    # 3) Promedio de venta por turno/día según empleado
    def promedio_venta_por_turno(self):
        facturas = self.m_facturas.obtener_facturas()
        ventas_por_empleado = {}
        conteo_por_empleado = {}

        for fid, factura in facturas.items():
            eid = factura["empleado_id"]
            total = factura["totales"]["total"]
            ventas_por_empleado[eid] = ventas_por_empleado.get(eid, 0) + total
            conteo_por_empleado[eid] = conteo_por_empleado.get(eid, 0) + 1

        promedio_por_empleado = {}
        for eid in ventas_por_empleado:
            promedio_por_empleado[eid] = ventas_por_empleado[eid] / conteo_por_empleado[eid]

        return [(eid, self.nombre_completo_empleado(eid), promedio_por_empleado[eid]) for eid in promedio_por_empleado]

    # 4) Número de clientes atendidos por cada empleado
    def clientes_por_empleado(self):
        facturas = self.m_facturas.obtener_facturas()
        clientes_por_empleado = {}

        for fid, factura in facturas.items():
            eid = factura["empleado_id"]
            cid = factura["cliente_id"]
            clientes_por_empleado.setdefault(eid, set()).add(cid)

        return [(eid, self.nombre_completo_empleado(eid), len(clientes)) for eid, clientes in clientes_por_empleado.items()]

    # 5) Comparativa entre empleados nuevos y antiguos (total facturación)
    def comparativa_nuevos_antiguos(self):
        facturas = self.m_facturas.obtener_facturas()
        facturacion_nuevos = 0
        facturacion_antiguos = 0

        for fid, factura in facturas.items():
            eid = factura["empleado_id"]
            empleado = self.empleados.get(eid)
            if not empleado:
                continue
            total = factura["totales"]["total"]
            # Consideramos "nuevo" si fecha_contrato > hace 1 mes (simplificado)
            # Para ejemplo, todo anterior a "2025-11-04" es antiguo
            fecha_contrato = empleado.get("fecha_contrato")
            if fecha_contrato and fecha_contrato > "2025-11-04":
                facturacion_nuevos += total
            else:
                facturacion_antiguos += total

        return [("Nuevos", facturacion_nuevos), ("Antiguos", facturacion_antiguos)]

    # 6) Índice de conversión: visitas → servicios realizados
    def indice_conversion(self):
        facturas = self.m_facturas.obtener_facturas()
        visitas_por_empleado = {}
        servicios_realizados = {}

        for fid, factura in facturas.items():
            eid = factura["empleado_id"]
            visitas_por_empleado[eid] = visitas_por_empleado.get(eid, 0) + 1
            servicios_realizados[eid] = servicios_realizados.get(eid, 0)
            for linea in factura["lineas"]:
                if linea["tipo"] == "servicio":
                    servicios_realizados[eid] += linea["cantidad"]

        # índice = servicios/visitas
        indice = {}
        for eid in visitas_por_empleado:
            visitas = visitas_por_empleado[eid]
            servicios = servicios_realizados.get(eid, 0)
            indice[eid] = servicios / visitas if visitas else 0

        return [(eid, self.nombre_completo_empleado(eid), round(indice[eid], 2)) for eid in indice]

    # 7) Descuentos aplicados según empleado
    def descuentos_por_empleado(self):
        facturas = self.m_facturas.obtener_facturas()
        descuentos_por_empleado = {}

        for fid, factura in facturas.items():
            eid = factura["empleado_id"]
            descuento = factura["totales"].get("descuento", 0)
            descuentos_por_empleado[eid] = descuentos_por_empleado.get(eid, 0) + descuento

        return [(eid, self.nombre_completo_empleado(eid), descuentos_por_empleado[eid]) for eid in descuentos_por_empleado]


# ---------------------------
# Ejemplo de ejecución
# ---------------------------
if __name__ == "__main__":
    mc = M_cuestiones_Rafael()
    print("Facturación por empleado:", mc.facturacion_por_empleado())
    print("Tiempo total servicios:", mc.tiempo_total_servicios)
    print("Promedio venta por turno:", mc.promedio_venta_por_turno())
    print("Clientes por empleado:", mc.clientes_por_empleado())
    print("Comparativa nuevos/antiguos:", mc.comparativa_nuevos_antiguos())
    print("Índice de conversión:", mc.indice_conversion())
    print("Descuentos por empleado:", mc.descuentos_por_empleado())
