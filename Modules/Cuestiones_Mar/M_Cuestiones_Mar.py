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
        self.clientes = self.m_customers.GetCustomers()
        self.productos = self.m_productos.GetProducts()
        self.servicios = self.m_services.getServices()

    # -----------------------------
    # Función auxiliar nombre cliente
    # -----------------------------
    def nombre_cliente(self, cid):
        c = self.clientes.get(cid)
        return f"{c['name']} {c['surname']}" if c else "Desconocido"

    # -----------------------------
    # 1. Ingresos totales por categoría
    # -----------------------------
    def ingresos_por_categoria(self):
        ingresos = defaultdict(float)
        for fid, f in self.m_facturas.obtener_facturas().items():
            for linea in f["lineas"]:
                tipo = linea["tipo"]
                if tipo == "producto":
                    prod = self.productos.get(linea["id_referencia"])
                    categoria = prod.get("description", "Sin categoría") if prod else "Desconocido"
                else:
                    serv = self.servicios.get(linea["id_referencia"])
                    categoria = serv.get("category", "Sin categoría") if serv else "Desconocido"
                ingresos[categoria] += linea["total_linea"]
        return dict(ingresos)

    # -----------------------------
    # 2. Variación mensual de facturación por ciudad
    # -----------------------------
    def variacion_mensual_por_ciudad(self):
        datos = defaultdict(lambda: defaultdict(float))
        for fid, f in self.m_facturas.obtener_facturas().items():
            fecha = datetime.strptime(f['fecha'], '%Y-%m-%d')
            mes = fecha.strftime('%Y-%m')
            cliente = self.clientes.get(f['cliente_id'])
            ciudad = cliente['city'] if cliente else "Desconocido"
            total = f['totales']['total']
            datos[ciudad][mes] += total
        return {c: dict(meses) for c, meses in datos.items()}

    # -----------------------------
    # 3. Impacto del IVA
    # -----------------------------
    def impacto_iva(self):
        impacto = defaultdict(float)
        for fid, f in self.m_facturas.obtener_facturas().items():
            for linea in f["lineas"]:
                tipo = linea["tipo"]
                iva = f["totales"].get("iva_porcentaje", 0)
                impacto[tipo] += linea["total_linea"] * iva / 100
        return dict(impacto)

    # -----------------------------
    # 4. Distribución gasto por empleado
    # -----------------------------
    def gasto_por_empleado(self):
        gasto = defaultdict(float)
        for fid, f in self.m_facturas.obtener_facturas().items():
            cliente = self.clientes.get(f['cliente_id'])
            empleado = cliente.get('empleado_asignado', 'Desconocido') if cliente else 'Desconocido'
            gasto[empleado] += f['totales']['total']
        return dict(gasto)

    # -----------------------------
    # 5. Productos/servicios que generan más retorno (repetición)
    # -----------------------------
    def retorno_clientes(self):
        conteo = defaultdict(lambda: defaultdict(int))
        for fid, f in self.m_facturas.obtener_facturas().items():
            cid = f['cliente_id']
            for linea in f["lineas"]:
                pid = linea['id_referencia']
                conteo[pid][cid] += 1
        retorno = {pid: len([c for c, v in clientes.items() if v > 1])
                   for pid, clientes in conteo.items()}
        return retorno

    # -----------------------------
    # 6. Valor de cliente a lo largo del tiempo (CLV)
    # -----------------------------
    def clv_por_cliente(self):
        clv = defaultdict(float)
        for fid, f in self.m_facturas.obtener_facturas().items():
            clv[f['cliente_id']] += f['totales']['total']
        return {cid: {"nombre": self.nombre_cliente(cid), "clv": total} for cid, total in clv.items()}

    # -----------------------------
    # 7. Tasa de crecimiento por empleado-producto-ciudad
    # -----------------------------
    def tasa_crecimiento(self):
        datos = defaultdict(lambda: defaultdict(lambda: defaultdict(list)))
        for fid, f in self.m_facturas.obtener_facturas().items():
            cliente = self.clientes.get(f['cliente_id'])
            empleado = cliente.get('empleado_asignado', 'Desconocido') if cliente else 'Desconocido'
            ciudad = cliente['city'] if cliente else 'Desconocido'
            for linea in f["lineas"]:
                datos[(empleado, linea['id_referencia'], ciudad)][f['fecha']].append(linea['total_linea'])
        
        crecimiento = {}
        for key, fechas in datos.items():
            fechas_ordenadas = sorted(fechas)
            valores = [sum(fechas[f]) for f in fechas_ordenadas]
            crecimiento[key] = (valores[-1] - valores[0]) / valores[0] * 100 if len(valores) > 1 else 0
        return crecimiento

    # -----------------------------
    # Ejecutar todas las estadísticas
    # -----------------------------
    def ejecutar_todo(self):
        return {
            "ingresos_por_categoria": self.ingresos_por_categoria(),
            "variacion_mensual_por_ciudad": self.variacion_mensual_por_ciudad(),
            "impacto_iva": self.impacto_iva(),
            "gasto_por_empleado": self.gasto_por_empleado(),
            "retorno_clientes": self.retorno_clientes(),
            "clv_por_cliente": self.clv_por_cliente(),
            "tasa_crecimiento": self.tasa_crecimiento()
        }


if __name__ == "__main__":
    mc = M_Cuestiones_Mar()
    import json
    print(json.dumps(mc.ejecutar_todo(), indent=4))