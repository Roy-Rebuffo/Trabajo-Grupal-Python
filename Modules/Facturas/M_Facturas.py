import json
import os
from datetime import datetime
from decimal import Decimal, ROUND_HALF_UP
from .Generar_Facturas import Generar_Factura


#Ruta tanto de clientes como de productos
class M_Facturas:
    def __init__(self, ruta_clientes= "./Data/clientes.json", ruta_productos= "./Data/productos.json"):
        self.ruta_clientes = ruta_clientes
        self.ruta_productos = ruta_productos
        self._clientes = None
        self._productos = None
    
    def _cargar_json(self,ruta):
        #Carga el archivo JSON desde disco, si no existe devuelve la lista vacia
        if not os.path.exists(ruta):
            return []
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
            p = self.buscar_productos(ls["producto_id"])
            if not p: raise ValueError(f"Producto {ls['producto_id']} no encontrado")
            lineas.append({
                "producto_id": p["id"],
                "nombre_producto": p["name"],
                "precio_unitario": float(p["price"]),
                "cantidad": int(ls["cantidad"]),
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
    
    def crear_factura(self, numero, cliente_id, lineas_solicitadas, iva=21, descuento = 0):
        cliente = self.buscar_cliente(cliente_id)
        if not cliente:
            raise ValueError(f"Cliente {cliente_id} no encontrado")
        lineas = self.lineas_facturas(lineas_solicitadas)
        totales = self.calcular_totales(lineas, iva, descuento)
        return {
            "numero": numero,
            "fecha": datetime.now().strftime("%Y-%m-%d"),
            "cliente_id": cliente_id,
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

class Api:
    def __init__(self, ruta_clientes, ruta_productos):
        self.facturas = M_Facturas(ruta_clientes, ruta_productos)

    def get_productos(self):
        productos = self.facturas.productos()
        print("Productos cargados:", productos)  # 👈 esto debe mostrar tu dict en consola
        return [
        {"id": p["id"], "name": p["name"], "price": p["price"]}
        for p in productos.values()
        ]

    def get_clientes(self):
        clientes = self.facturas.clientes()
        print("Clientes cargados:", clientes)  # 👈 prueba en consola
        return [
        {
            "id": cid,
            "name": c["name"],
            "surname": c["surname"],
            "email": c["email"],
            "phone": c["phone"],
            "city": c["city"]
        }
        for cid, c in clientes.items()
        ]


    def crear_factura(self, numero, cliente_id, lineas, iva=21, descuento=0):
        factura = self.facturas.crear_factura(numero, cliente_id, lineas, iva, descuento)
        ruta_pdf = Generar_Factura.generar_factura_pdf(factura)
        return {"factura": factura, "pdf": ruta_pdf}

