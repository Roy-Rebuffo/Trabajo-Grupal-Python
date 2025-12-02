from tkinter import messagebox
from datetime import datetime
import json
import os

ROLES = ["ADMINISTRADOR", "EMPLEADO"]

PERMISOS = {
    "ADMINISTRADOR" : ["crear_factura", "modificar_producto", "registrar_cliente", "gestionar_usuarios"],
    "EMPLEADO": ["crear_factura", "registrar_cliente"]
}

# Ruta json
ruta = "./Data/usuarios.json"

class M_users:
    def __init__(self, id_usuario,nombre,apellido, email, telefono, ciudad,fecha_contrato,rol):
        self.id_usuario = id_usuario
        self.nombre = nombre
        self.apellido = apellido
        self.email = email
        self.telefono = telefono
        self.ciudad = ciudad
        self.fecha_contrato = fecha_contrato
        self.rol = rol
    
    def to_dict(self):
        return {
            "id_usuario": self.id_usuario,
            "nombre": self.nombre,
            "apellido": self.apellido,
            "email": self.email,
            "telefono": self.telefono,
            "ciudad": self.ciudad,
            "fecha_contrato": self.fecha_contrato,
            "rol": self.rol
        }
    
def guardar_usuario(usuario, ruta="usuarios.json"):

    # Crear si no existe
    carpeta = os.path.dirname(ruta)
    if carpeta and not os.path.exists(carpeta):
         os.makedirs(carpeta)

    try:
        with open(ruta, "r") as f:
            data = json.load(f)
    except FileExistsError:
            data = []

    data.append(usuario.to_dict())

    with open(ruta, "w") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

    messagebox.showinfo("ÉXITO", f"Usuario {usuario.nombre} se ha guardado correctamente.")

def cargar_usuarios():
    if not os.path.exists(ruta):
         return []
    with open(ruta, "r") as f:
        return json.load(f)
        
def guardar_usuario(usuario_dict):
    usuarios = cargar_usuarios()
    nuevo_id = len(usuarios) + 1
    usuario = M_users(id_usuario=nuevo_id, **usuario_dict)
    usuarios.append(usuario.to_dict())

    os.makedirs(os.path.dirname(ruta), exist_ok=True)
    with open(ruta, "w") as f:
        json.dump(usuarios, f, indent=4, ensure_ascii=False)

class Api:
    def agregar_usuario(self, usuario_dict):
        guardar_usuario(usuario_dict)
        return "OK"





