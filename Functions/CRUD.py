import json
from pprint import pprint
import uuid

class Methods:

    @staticmethod
    def GetAll(filepath):
        try:
            with open(filepath, 'r') as fich:
                data = json.load(fich)
                return data
        except FileNotFoundError as error:
            print("Error:", error)

    @staticmethod
    def AddMany(filepath, element):
        data = Methods.GetAll(filepath)
        data.update(element)
        print(data)
        try:
            with open(filepath, 'w') as fich:
                json.dump(data, fich, indent=4)
                print("Datos guardados correctamente.")
        except Exception as error:
            print("Error al guardar los datos:", error)

    @staticmethod
    def Delete(filepath, element_id):
        data = Methods.GetAll(filepath)
        if element_id in data:
            del data[element_id]
            try:
                with open(filepath, 'w') as fich:
                    json.dump(data, fich, indent=4)
                    print(f"Elemento con ID {element_id} eliminado correctamente.")
            except Exception as error:
                print("Error al eliminar el elemento:", error)
        else:
            print(f"No se encontró el elemento con ID {element_id}.")

    @staticmethod
    def Update(filepath, element_id, new_data):
        data = Methods.GetAll(filepath)
        if element_id in data:
            data[element_id].update(new_data)
            try:
                with open(filepath, 'w') as fich:
                    json.dump(data, fich, indent=4)
                    print(f"Elemento con ID {element_id} actualizado correctamente.")
            except Exception as error:
                print("Error al actualizar el elemento:", error)
        else:
            print(f"No se encontró el elemento con ID {element_id}.")

    @staticmethod
    def AddOne(filepath, customer_data):
        data = Methods.GetAll(filepath)
        element_id = str(uuid.uuid4())
        if element_id not in data:
            data[element_id] = customer_data
            try:
                with open(filepath, 'w') as fich:
                    json.dump(data, fich, indent=4)
                    print(f"Elemento con ID {element_id} añadido correctamente.")
            except Exception as error:
                print("Error al añadir el elemento:", error)
        else:
            print(f"El elemento con ID {element_id} ya existe.")

    @staticmethod
    def GetOneById(filepath, element_id):
        data = Methods.GetAll(filepath)
        return data.get(element_id, None)

    @staticmethod
    def AddOneDict(filepath, key_id, item_data):
        """
        Añade un ítem al archivo JSON, usando key_id (personalizada, ej. PR-0001) 
        como la clave principal en el objeto JSON.
        """
        # 1. Cargar todos los datos existentes (usa tu propio GetAll)
        data = Methods.GetAll(filepath)
        
        # 2. Insertar el nuevo ítem usando la clave proporcionada (key_id)
        data[key_id] = item_data
        
        # 3. Guardar el diccionario completo de vuelta al archivo
        try:
            with open(filepath, 'w') as fich:
                json.dump(data, fich, indent=4)
                print(f"Elemento con ID {key_id} añadido correctamente.")
        except Exception as error:
            print("Error al guardar los datos:", error)