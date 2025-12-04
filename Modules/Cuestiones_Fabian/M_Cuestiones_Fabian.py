# estadisticas_grupo1.py

from Modules.customers.M_Customers import M_Customers
from Modules.Facturas.M_Facturas import M_Facturas
from Modules.products.M_Products import M_Products
from Modules.services.M_Services import M_Services

class M_cuestiones_Fabian:
    def __init__(self):
        self.m_customers = M_Customers()
        self.m_facturas = M_Facturas()
        self.m_productos = M_Products()
        self.m_services = M_Services()
        self.clientes = self.m_customers.GetCustomers()

    # Función auxiliar para obtener nombre completo
    def nombre_completo(self, cid):
        cliente = self.clientes.get(cid)
        if cliente:
            return f"{cliente['name']} {cliente['surname']}"
        return "Desconocido"

    # -----------------------------
    # 1. Clientes que más han gastado
    # -----------------------------
    def top_clientes_por_gasto(self, limit=10):
        facturas = self.m_facturas.obtener_facturas()
        gasto_por_cliente = {}

        for fid, factura in facturas.items():
            cid = factura["cliente_id"]
            total = factura["totales"]["total"]
            gasto_por_cliente[cid] = gasto_por_cliente.get(cid, 0) + total

        ranking = sorted(gasto_por_cliente.items(), key=lambda x: x[1], reverse=True)
        return [(cid, self.nombre_completo(cid), total) for cid, total in ranking[:limit]]

    # -----------------------------
    # 2. Ticket promedio por cliente
    # -----------------------------
    def ticket_promedio_por_cliente(self):
        facturas = self.m_facturas.obtener_facturas()
        facturas_por_cliente = {}

        for fid, factura in facturas.items():
            cid = factura["cliente_id"]
            facturas_por_cliente.setdefault(cid, []).append(factura)

        resultados = {}
        for cid, facturas_cliente in facturas_por_cliente.items():
            total = sum(f["totales"]["total"] for f in facturas_cliente)
            promedio = total / len(facturas_cliente)
            resultados[cid] = (self.nombre_completo(cid), promedio)

        return resultados

    # -----------------------------
    # 3. Productos más comprados por clientes activos
    # -----------------------------
    def productos_mas_comprados_por_clientes_activos(self, limit=10):
        facturas = self.m_facturas.obtener_facturas()
        activos = {cid for cid, c in self.clientes.items() if c["active"]}

        conteo = {}
        for fid, factura in facturas.items():
            cid = factura["cliente_id"]
            if cid not in activos:
                continue
            for linea in factura["lineas"]:
                if linea["tipo"] == "producto":
                    pid = linea["id_referencia"]
                    conteo.setdefault(pid, []).append(cid)

        ranking = sorted(conteo.items(), key=lambda x: len(x[1]), reverse=True)
        top = {}
        for pid, cids in ranking[:limit]:
            top[pid] = [(cid, self.nombre_completo(cid)) for cid in set(cids)]
        return top

    # -----------------------------
    # 4. Clientes que consumen más servicios que productos
    # -----------------------------
    def clientes_mas_servicios_que_productos(self):
        facturas = self.m_facturas.obtener_facturas()
        cuenta = {}

        for fid, factura in facturas.items():
            cid = factura["cliente_id"]
            cuenta.setdefault(cid, {"productos": 0, "servicios": 0})
            for linea in factura["lineas"]:
                if linea["tipo"] == "producto":
                    cuenta[cid]["productos"] += linea["cantidad"]
                else:
                    cuenta[cid]["servicios"] += linea["cantidad"]

        resultado = [(cid, self.nombre_completo(cid)) for cid, datos in cuenta.items()
                     if datos["servicios"] > datos["productos"]]
        return resultado

    # -----------------------------
    # 5. Total gastado por ciudad
    # -----------------------------
    def gasto_por_ciudad(self):
        facturas = self.m_facturas.obtener_facturas()
        gasto_ciudad = {}

        for fid, factura in facturas.items():
            cid = factura["cliente_id"]
            ciudad = self.clientes[cid]["city"]
            total = factura["totales"]["total"]
            gasto_ciudad.setdefault(ciudad, []).append((cid, self.nombre_completo(cid), total))

        return gasto_ciudad

    # -----------------------------
    # 6. Número de compras por franja de edad
    # -----------------------------
    def compras_por_franja_edad(self):
        facturas = self.m_facturas.obtener_facturas()
        franjas = {
            "18-25": [],
            "26-35": [],
            "36-50": [],
            "50+": []
        }

        for fid, factura in facturas.items():
            cid = factura["cliente_id"]
            edad = self.clientes[cid]["age"]
            entry = (cid, self.nombre_completo(cid))
            if 18 <= edad <= 25:
                franjas["18-25"].append(entry)
            elif 26 <= edad <= 35:
                franjas["26-35"].append(entry)
            elif 36 <= edad <= 50:
                franjas["36-50"].append(entry)
            else:
                franjas["50+"].append(entry)

        return franjas

    # -----------------------------
    # 7. Top clientes según servicios solicitados
    # -----------------------------
    def top_clientes_por_servicios(self, limit=10):
        facturas = self.m_facturas.obtener_facturas()
        conteo = {}

        for fid, factura in facturas.items():
            cid = factura["cliente_id"]
            for linea in factura["lineas"]:
                if linea["tipo"] == "servicio":
                    conteo[cid] = conteo.get(cid, 0) + linea["cantidad"]

        ranking = sorted(conteo.items(), key=lambda x: x[1], reverse=True)
        return [(cid, self.nombre_completo(cid), cantidad) for cid, cantidad in ranking[:limit]]


    # -----------------------------
    # Ejecutar todas las estadísticas del Grupo 1
    # -----------------------------
    def ejecutar_grupo_1(self):
        print("1) Top clientes por gasto:")
        print(self.top_clientes_por_gasto())

        print("\n2) Ticket promedio por cliente:")
        print(self.ticket_promedio_por_cliente())

        print("\n3) Productos más comprados por clientes activos:")
        print(self.productos_mas_comprados_por_clientes_activos())

        print("\n4) Clientes que consumen más servicios que productos:")
        print(self.clientes_mas_servicios_que_productos())

        print("\n5) Gasto total por ciudad:")
        print(self.gasto_por_ciudad())

        print("\n6) Compras por franja de edad:")
        print(self.compras_por_franja_edad())

        print("\n7) Top clientes por servicios solicitados:")
        print(self.top_clientes_por_servicios())


if __name__ == "__main__":
    mc = M_cuestiones_Fabian()
    mc.ejecutar_grupo_1()
