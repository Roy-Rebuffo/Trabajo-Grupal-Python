from fpdf import FPDF
import os

class Generar_Factura(FPDF):
    #Cabecera del pdf
    def header(self):
        self.image("./Modules/Facturas/draco_header.png", x=170, y=8, w=30)  # 👈 ajusta ruta y tamaño

    # Espacio debajo del logo
        self.set_xy(45, 10)  # 👈 mueve el cursor a la derecha del logo


        self.set_font("Arial", "B", 12)
        self.cell(0, 8, "Draco Styles S.L", ln=True)
        self.set_font("Arial", "", 10)
        self.cell(0, 6, "CIF: B-12345678 · Calle Ejemplo 123 · Madrid", ln=True)
        self.ln(4)

    #Pie de pagina
    def footer(self):
        self.set_y(-16)
        self.set_font("Arial", "I", 8)
        self.cell(0, 10, "Gracias por su confianza. ", 0, 0, "C")
    
    def generar_factura_pdf(factura, ruta_salida="./Modules/Facturas/FacturasGenerales"):
        os.makedirs(ruta_salida, exist_ok=True)
        nombre_pdf = f"Factura_{factura['numero']}.pdf"
        path_pdf = os.path.join(ruta_salida, nombre_pdf)

        pdf = Generar_Factura()
        pdf.add_page()

        #Datos para la factua
        pdf.set_font("Arial", "B", 12)
        pdf.cell(0, 10, f"Factura Nº: {factura['numero']}", ln=True)
        pdf.set_font("Arial", "", 10)
        pdf.cell(0, 8, f"Fecha: {factura['fecha']}", ln=True)
        pdf.ln(4)

        # Datos cliente
        c = factura["cliente"]
        pdf.set_font("Arial", "B", 11)
        pdf.cell(0, 8, "Datos del cliente:", ln=True)
        pdf.set_font("Arial", "", 10)
        pdf.multi_cell(0, 6,
            f"{c['nombre']} {c['apellido']}\n"
            f"Email: {c['email']} · Tel: {c['telefono']}\n"
            f"Ciudad: {c['ciudad']}"
        )
        pdf.ln(4)

        # Tabla de productos
        pdf.set_font("Arial", "B", 10)
        pdf.cell(90, 8, "Producto", 1)
        pdf.cell(25, 8, "Cant.", 1, align="C")
        pdf.cell(35, 8, "Precio", 1, align="R")
        pdf.cell(40, 8, "Importe", 1, align="R")
        pdf.ln()

        pdf.set_font("Arial", "", 10)
        for l in factura["lineas"]:
            importe = float(l["precio_unitario"]) * float(l["cantidad"])
            pdf.cell(90, 8, l["nombre_producto"], 1)
            pdf.cell(25, 8, str(l["cantidad"]), 1, align="C")
            pdf.cell(35, 8, f"{l['precio_unitario']:.2f} EUR", 1, align="R")
            pdf.cell(40, 8, f"{importe:.2f} EUR", 1, align="R")
            pdf.ln()

        pdf.ln(4)

        # Totales
        t = factura["totales"]
        pdf.set_font("Arial", "B", 10)
        pdf.cell(0, 6, f"Subtotal: {t['subtotal']:.2f} EUR", ln=True, align="R")
        pdf.cell(0, 6, f"Descuento ({t['descuento_porcentaje']}%): {t['descuento']:.2f} EUR", ln=True, align="R")
        pdf.cell(0, 6, f"Base imponible: {t['base']:.2f} EUR", ln=True, align="R")
        pdf.cell(0, 6, f"IVA ({t['iva_porcentaje']}%): {t['iva']:.2f} EUR", ln=True, align="R")
        pdf.cell(0, 6, f"Total: {t['total']:.2f} EUR", ln=True, align="R")

        pdf.output(path_pdf)
        return path_pdf
