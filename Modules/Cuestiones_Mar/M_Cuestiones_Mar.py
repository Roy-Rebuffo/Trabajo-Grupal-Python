import json
from collections import defaultdict
from datetime import datetime

from Modules.customers.M_Customers import M_Customers
from Modules.Facturas.M_Facturas import M_Facturas
from Modules.products.M_Products import M_Products
from Modules.services.M_Services import M_Services

class M_Cuestiones_Mar:
    def __init__(self):
        self.m_customers = M_Customers()
        self.m_facturas = M_Facturas()
        self.m_productos = M_Products()
        self.m_services = M_Services()

        # Clientes como diccionario con ID como key
        self.clientes = self.m_customers.GetCustomers()
        self.productos = self.m_productos.GetProducts()
        self.servicios = self.m_services.getServices()

    # -----------------------------
    # Función auxiliar: nombre completo
    # -----------------------------
    def nombre_completo(self, cid):
        cliente = self.clientes.get(cid)
        if cliente:
            return f"{cliente.get('name', 'Desconocido')} {cliente.get('surname', '')}"
        return "Desconocido"

    # -----------------------------
    # 1. Ingresos por categoría
    # -----------------------------
    def ingresos_por_categoria(self):
        ingresos = defaultdict(float)
        facturas = self.m_facturas.obtener_facturas()
        for fid, f in facturas.items():
            for linea in f["lineas"]:
                tipo = linea["tipo"]
                if tipo == "producto":
                    prod = self.productos.get(linea["id_referencia"])
                    categoria = prod.get("description", "Sin categoría") if prod else "Desconocido"
                else:
                    serv = self.servicios.get(linea["id_referencia"])
                    categoria = serv.get("category", "Sin categoría") if serv else "Desconocido"
                ingresos[categoria] += linea.get("total_linea", linea.get("precio_unitario",0) * linea.get("cantidad",1))
        return dict(ingresos)

    # -----------------------------
    # 2. Variación mensual de facturación por ciudad
    # -----------------------------
    def variacion_mensual_por_ciudad(self):
        datos = defaultdict(lambda: defaultdict(float))
        facturas = self.m_facturas.obtener_facturas()
        for fid, f in facturas.items():
            fecha = datetime.strptime(f["fecha"], "%Y-%m-%d")
            mes = fecha.strftime("%Y-%m")
            cid = f["cliente_id"]
            cliente = self.clientes.get(cid, {})
            ciudad = cliente.get("city", "Desconocida")
            total = f["totales"].get("total", 0)
            datos[ciudad][mes] += total
        return {c: dict(meses) for c, meses in datos.items()}

    # -----------------------------
    # 3. Impacto del IVA
    # -----------------------------
    def impacto_iva(self):
        impacto = defaultdict(float)
        facturas = self.m_facturas.obtener_facturas()
        for fid, f in facturas.items():
            for linea in f["lineas"]:
                tipo = linea["tipo"]
                iva = f.get("totales", {}).get("iva_porcentaje", 0)
                total_linea = linea.get("total_linea", linea.get("precio_unitario",0)*linea.get("cantidad",1))
                impacto[tipo] += total_linea * iva / 100
        return dict(impacto)

    # -----------------------------
    # 4. Gasto por empleado
    # -----------------------------
    def gasto_por_empleado(self):
        gasto = defaultdict(float)
        facturas = self.m_facturas.obtener_facturas()
        for fid, f in facturas.items():
            empleado_id = f.get("empleado_id", "Desconocido")
            total = f.get("totales", {}).get("total", 0)
            gasto[empleado_id] += total
        return dict(gasto)

    # -----------------------------
    # 5. Retorno de clientes 
    # -----------------------------
    def retorno_clientes(self):
        conteo = defaultdict(lambda: defaultdict(int))
        facturas = self.m_facturas.obtener_facturas()
        for fid, f in facturas.items():
            cliente_id = f["cliente_id"]
            for linea in f["lineas"]:
                conteo[linea["id_referencia"]][cliente_id] += 1
        retorno = {k: len([c for c,v in v.items() if v>1]) for k,v in conteo.items()}
        return retorno

    # -----------------------------
    # 6. CLV por cliente
    # -----------------------------
    def clv_por_cliente(self):
        clv = defaultdict(float)
        facturas = self.m_facturas.obtener_facturas()
        for fid, f in facturas.items():
            cid = f["cliente_id"]
            total = f.get("totales", {}).get("total", 0)
            clv[cid] += total
        return {cid: {"clv": v, "nombre": self.nombre_completo(cid)} for cid, v in clv.items()}

    # -----------------------------
    # 7. Tasa de crecimiento por empleado-producto-ciudad
    # -----------------------------
    def tasa_crecimiento(self):
        datos = defaultdict(lambda: defaultdict(list))
        facturas = self.m_facturas.obtener_facturas()
        for fid, f in facturas.items():
            cid = f["cliente_id"]
            cliente = self.clientes.get(cid, {})
            empleado = f.get("empleado_id", "Desconocido")
            ciudad = cliente.get("city", "Desconocida")
            for linea in f["lineas"]:
                key = f"{empleado}|{linea['id_referencia']}|{ciudad}"
                total_linea = linea.get("total_linea", linea.get("precio_unitario",0)*linea.get("cantidad",1))
                datos[key][f["fecha"]].append(total_linea)

        crecimiento = {}
        for key, fechas in datos.items():
            fechas_ordenadas = sorted(fechas.keys())
            valores = [sum(fechas[fecha]) for fecha in fechas_ordenadas]
            porcentaje = (valores[-1] - valores[0]) / valores[0] * 100 if len(valores) > 1 and valores[0] != 0 else 0
            empleado, producto, ciudad = key.split("|")
            crecimiento[key] = {"empleado": empleado, "producto": producto, "ciudad": ciudad, "porcentaje": round(porcentaje,2)}
        return crecimiento

if __name__ == "__main__":
    mc = M_Cuestiones_Mar()
    print("Ingresos por categoría:", mc.ingresos_por_categoria())
    print("Variación mensual por ciudad:", mc.variacion_mensual_por_ciudad())
    print("Impacto IVA:", mc.impacto_iva())
    print("Gasto por empleado:", mc.gasto_por_empleado())
    print("Retorno de clientes:", mc.retorno_clientes())
    print("CLV por cliente:", mc.clv_por_cliente())
    print("Tasa de crecimiento:", mc.tasa_crecimiento())
