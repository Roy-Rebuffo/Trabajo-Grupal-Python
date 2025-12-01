# Modules/products/M_Products.py
from Functions.CRUD import Methods
from typing import Dict, Any, List

ARCHIVO_DATOS = "Data/productos.json"
ID_PREFIX = "PR-" # Prefijo para Productos

class M_Products:
    
    def _get_next_product_id(self) -> str:
        """
        Calcula el siguiente ID secuencial (PR-0001, PR-0002...).
        Asume un relleno de 4 dígitos.
        """
        # Obtener todos los productos para encontrar el ID numérico más alto
        all_products: Dict[str, Any] = Methods.GetAll(ARCHIVO_DATOS)
        
        current_max_num = 0
        
        for id_key in all_products.keys():
            if id_key.startswith(ID_PREFIX):
                try:
                    # Extraer '0001' de 'PR-0001'
                    num_str = id_key.replace(ID_PREFIX, "")
                    current_num = int(num_str)
                    
                    if current_num > current_max_num:
                        current_max_num = current_num
                except ValueError:
                    # Ignorar IDs que no sigan el formato (ej. UUIDs antiguos)
                    continue

        # Calcular y formatear el siguiente número (ej. 1 -> 0001)
        next_num = current_max_num + 1
        return f"{ID_PREFIX}{next_num:04d}"


    # 1. INTRODUCIR DATOS (Obligatoria) - Modificado para ID secuencial
    def AddProduct(self, product_data: Dict[str, Any]):
        """Añade un solo producto, generando un ID secuencial PR-XXXX."""
        
        # 1. Generar la ID personalizada
        new_id = self._get_next_product_id()
        
        # 2. Añadir el ID también dentro del objeto de datos
        product_data['id'] = new_id 

        # 3. Llamar al NUEVO método AddOneDict, pasándole la clave y los datos por separado.
        Methods.AddOneDict(ARCHIVO_DATOS, new_id, product_data) 
        
        # ESTO ES LO QUE ESTABA CAUSANDO EL ERROR 'AttributeError'
        # Ahora que AddOneDict existe, ¡funcionará!

    # 2. LISTAR INFORMACIÓN (Obligatoria)
    def GetProducts(self) -> Dict[str, Any]:
        """Devuelve el diccionario completo de todos los productos."""
        return Methods.GetAll(ARCHIVO_DATOS)

    # 3. PREGUNTA ESTADÍSTICA (Ranking/Consulta Compleja)
    def GetTopStocked(self, count: int = 5) -> List[Dict[str, Any]]:
        """Devuelve los 'count' productos con el stock más alto."""
        all_products: Dict[str, Any] = Methods.GetAll(ARCHIVO_DATOS)
        
        # Convertir el diccionario a una lista de productos para ordenar
        products_list = list(all_products.values())
        
        sorted_products = sorted(
            products_list, 
            key=lambda p: p.get('stock', 0), 
            reverse=True
        )
        return sorted_products[:count]
    # --- Otras Funciones CRUD ---
    
    # def GetProductById(self, product_id: int) -> Dict[str, Any]:
    #     """Obtiene un producto específico por su ID."""
    #     return Methods.GetOneById(ARCHIVO_DATOS, product_id)
        
    # def UpdateProduct(self, product_id: int, new_data: Dict[str, Any]):
    #     """Actualiza los datos de un producto por su ID."""
    #     Methods.update(ARCHIVO_DATOS, product_id, new_data)

    # def DeleteProduct(self, product_id: int):
    #     """Elimina un producto por su ID."""
    #     Methods.Delete(ARCHIVO_DATOS, product_id)

    # def AddProducts(self, products: List[Dict[str, Any]]):
    #     """Añade múltiples productos."""
    #     Methods.AddMany(ARCHIVO_DATOS, products)