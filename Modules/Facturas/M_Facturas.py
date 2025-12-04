#Instalar la libreria 
# pip install fpdf2


import json
import uuid
import os
from datetime import datetime
from decimal import Decimal, ROUND_HALF_UP
from Modules.Facturas.Generar_Facturas import Generar_Factura
from Modules.customers.M_Customers import M_Customers
#Ruta tanto de clientes como de productos
ruta_clientes= "./Data/clientes.json"
ruta_productos= "./Data/productos.json"
ruta_servicios = "./Data/servicios.json"
ruta_facturas = "./Data/facturas.json"

class Facturas:
    def __init__(self, ruta_clientes= "./Data/clientes.json", ruta_productos= "./Data/productos.json", ruta_servicios = "./Data/servicios.json"):
        self.ruta_clientes = ruta_clientes
        self.ruta_productos = ruta_productos
        self.ruta_servicios = ruta_servicios
        self._clientes = None
        self._productos = None
        
    def servicios(self):
        return self._cargar_json(ruta_servicios)

    def buscar_servicio(self, servicio_id):
        return self.servicios().get(servicio_id)

    
    def _cargar_json(self,ruta):
        #Carga el archivo JSON desde disco, si no existe devuelve la lista vacia
        if not os.path.exists(ruta):
            return {}
        with open(ruta, "r") as f:
            return json.load(f)
    
    def clientes(self):
        #Devuelve los clientes cargados desde el JSON
        return self._clientes or self._cargar_json(self.ruta_clientes)
    
    def productos(self):
        #Devuelve los productos cargados desde el JSON
        return self._productos or self._cargar_json(self.ruta_productos)
    
    def buscar_cliente(self, cliente_id):
        # Busca un cliente por su clave (ej: "ID2")
        return self.clientes().get(cliente_id)
    
    def buscar_productos(self, producto_id):
        # Busca un producto por su clave (ej: "PR-0001")
        return self.productos().get(producto_id)
    
    def lineas_facturas(self, lineas_solicitadas):
        lineas = []
        for ls in lineas_solicitadas:
            tipo = ls.get("tipo")
            ref = ls.get("id_referencia")
            cantidad = int(ls.get("cantidad", 1))
            precio = float(ls.get("precio_unitario", 0))
    
            if tipo == "producto":
                p = self.buscar_productos(ref)
                if not p:
                    raise ValueError(f"Producto {ref} no encontrado")
                nombre = p.get("name", "Producto")
            elif tipo == "servicio":
                s = self.buscar_servicio(ref)
                if not s:
                    raise ValueError(f"Servicio {ref} no encontrado")
                nombre = s.get("name", "Servicio")
            else:
                raise ValueError(f"Tipo desconocido en línea: {tipo}")
    
            lineas.append({
                "id_referencia": ref,
                "tipo": tipo,
                "nombre": nombre,
                "precio_unitario": precio,
                "cantidad": cantidad,
                "total_linea": round(precio * cantidad, 2)
            })
        return lineas

        
    #Calculo generales para los precios de la factura
    def calcular_totales(self, lineas, iva=21, descuento=0):
        subtotal = sum(Decimal(str(l["precio_unitario"]))* l["cantidad"] for l in lineas)
        desc = (subtotal * descuento / 100).quantize(Decimal("0.01"), ROUND_HALF_UP)
        base = (subtotal - desc).quantize(Decimal("0.01"), ROUND_HALF_UP)
        iva_val = (base * iva / 100).quantize(Decimal("0.01"), ROUND_HALF_UP)
        total = (base + iva_val).quantize(Decimal("0.01"), ROUND_HALF_UP)
        return{
            "subtotal": float(subtotal), 
            "descuento": float(desc),
            "base": float(base),
            "iva": float(iva_val),
            "total": float(total),
            "iva_porcentaje": iva,
            "descuento_porcentaje": descuento
        }
    
    def crear_factura(self, cliente_id, empleado_id, lineas_solicitadas, iva=21, descuento=0):
        numero = f"FAC-{str(uuid.uuid4())[:8]}"  # Genera número    único automático

        cliente = self.buscar_cliente(cliente_id)
        if not cliente:
            raise ValueError(f"Cliente {cliente_id} no encontrado")

        lineas = self.lineas_facturas(lineas_solicitadas)
        totales = self.calcular_totales(lineas, iva, descuento)

        return {
            "numero": numero,
            "fecha": datetime.now().strftime("%Y-%m-%d"),
            "cliente_id": cliente_id,
            "empleado_id":empleado_id,
            "cliente": {
                "nombre": cliente.get("name"),
                "apellido": cliente.get("surname"),
                "email": cliente.get("email"),
                "telefono": cliente.get("phone"),
                "ciudad": cliente.get("city"),
            },
            "lineas": lineas,
            "totales": totales
        }


class M_Facturas:
    def __init__(self):
        self.facturas = Facturas()
        self.ruta_facturas = "./Data/facturas.json"

    def obtener_facturas(self):
       
        if not os.path.exists(ruta_facturas):
            return {}  
        with open(ruta_facturas, "r", encoding="utf-8") as f:
            return json.load(f)
    
    def get_productos(self):
        productos = self.facturas.productos()
        return [
            {"id": p["id"], "name": p["name"], "price": p["price"]}
            for p in productos.values()
        ]

    def get_clientes(self):
        clientes = self.facturas.clientes()
        return [
            {
                "id": cid,
                "name": c.get("name", ""),
                "surname": c.get("surname", ""),
                "email": c.get("email", ""),
                "phone": c.get("phone", ""),
                "city": c.get("city", "")
            }
            for cid, c in clientes.items()
        ]

    def crear_factura(self, cliente_id, empleado_id, lineas, iva=21, descuento=0):
        # Crear objeto factura
        factura = self.facturas.crear_factura( cliente_id, empleado_id, lineas, iva, descuento)

        # Generar PDF
        ruta_pdf = Generar_Factura.generar_factura_pdf(factura)

        # Guardar en facturas.json
        os.makedirs(os.path.dirname(self.ruta_facturas), exist_ok=True)
        if os.path.exists(self.ruta_facturas):
            with open(self.ruta_facturas, "r", encoding="utf-8") as f:
                data = json.load(f)
        else:
            data = {}

        # Usar el número de factura como clave
        del factura["cliente"]
        data[factura["numero"]] = factura
        M_customers=M_Customers()
        M_customers.add_invoice(cliente_id,factura["numero"])

        with open(self.ruta_facturas, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4, ensure_ascii=False)

        return {"factura": factura, "pdf": ruta_pdf}
