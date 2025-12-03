# Modules/products/M_Products.py
from Functions.CRUD import Methods
from typing import Dict, Any, List
import os

ARCHIVO_DATOS = "Data/productos.json"
ID_PREFIX = "PR-" # Prefijo para Productos
ARCHIVO_ARCHIVADOS = "Data/productos_sin_stock.json"

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
        
    # 2. LISTAR INFORMACIÓN (Obligatoria)
    def GetProducts(self) -> Dict[str, Any]:
        """Devuelve el diccionario completo de todos los productos."""
        return Methods.GetAll(ARCHIVO_DATOS)

    # 3. OBTENER UNO POR ID
    def GetProductById(self, product_id: str) -> Dict[str, Any] | None:
        """Devuelve los datos de un producto específico por su ID."""
        return Methods.GetOneById(ARCHIVO_DATOS, product_id)

    # 4. ACTUALIZAR PRODUCTO
    def UpdateProduct(self, product_id: str, new_data: Dict[str, Any]):
        """Actualiza los datos de un producto por su ID."""
        Methods.Update(ARCHIVO_DATOS, product_id, new_data)

    # 5. ELIMINAR PRODUCTO
    def DeleteProduct(self, product_id: str):
        """Elimina un producto por su ID."""
        Methods.Delete(ARCHIVO_DATOS, product_id)
        
    # 6. REORDENAR (NUEVO MÉTODO)
    def GetReorderList(self) -> List[Dict[str, Any]]:
        """
        Devuelve todos los productos ordenados por stock de MENOR a MAYOR.
        """
        all_products: Dict[str, Any] = Methods.GetAll(ARCHIVO_DATOS)
        
        # Convertir el diccionario a una lista de productos para ordenar
        products_list = list(all_products.values())
        
        # Ordenar por el campo 'stock' de forma ascendente (MENOR a MAYOR)
        sorted_products = sorted(
            products_list, 
            key=lambda p: p.get('stock', 0), 
            reverse=False  # False para ordenar de menor a mayor stock
        )
        return sorted_products

    # 7. APLICAR DESCUENTO (NUEVO MÉTODO)
    def ApplyDiscount(self, percent: int, scope: str, scope_value: str = "") -> int:
        """
        Aplica un descuento porcentual a productos, según el alcance (single, category, all).
        Devuelve el número de productos actualizados.
        """
        all_products: Dict[str, Any] = Methods.GetAll(ARCHIVO_DATOS)
        updated_count = 0
        discount_factor = (100 - percent) / 100 # Ejemplo: 10% descuento -> 0.90
        
        # 1. Determinar los productos a actualizar
        products_to_update: Dict[str, Dict[str, Any]] = {}

        if scope == 'all':
            products_to_update = all_products
        
        elif scope == 'single':
            # Obtener el ID específico (el scope_value es el ID)
            product_id = scope_value.strip().upper()
            product = all_products.get(product_id)
            if product:
                products_to_update[product_id] = product
        
        elif scope == 'category':
            # Filtrar por categoría (el scope_value es la categoría)
            target_category = scope_value.strip().lower()
            for product_id, product_data in all_products.items():
                # Asumimos que la categoría está guardada en minúsculas en 'category'
                # y existe la clave 'category'
                if product_data.get('category', '').lower() == target_category:
                    products_to_update[product_id] = product_data

        # 2. Aplicar el descuento y actualizar
        for product_id, product_data in products_to_update.items():
            try:
                # Asegurarse de que el precio sea un número (puede ser float o int)
                current_price = float(product_data.get('price', 0))
                
                # Calcular el nuevo precio
                new_price = current_price * discount_factor
                
                # Opcional: Redondear a dos decimales
                rounded_new_price = round(new_price, 2)
                
                # Crear los datos a actualizar (solo el precio)
                update_data = {'price': rounded_new_price}
                
                # Llamar al método de actualización del CRUD
                Methods.Update(ARCHIVO_DATOS, product_id, update_data)
                
                updated_count += 1
                
            except (TypeError, ValueError) as e:
                print(f"ERROR: No se pudo aplicar descuento al producto {product_id}. Precio inválido. Detalle: {e}")
                continue # Continuar con el siguiente producto

        return updated_count
    
    # 7. OBTENER TODOS COMO LISTA (NUEVO MÉTODO PARA EXPORTACIÓN)
    def GetAllProductsAsList(self) -> List[Dict[str, Any]]:
        """
        Devuelve todos los productos como una lista de diccionarios (valores), 
        ideal para exportación o procesamiento en frontend.
        """
        # 1. Obtener el diccionario completo
        all_products: Dict[str, Any] = self.GetProducts() 
        
        # 2. Devolver solo los valores (los datos de los productos sin la clave ID)
        # Esto genera la lista que tu JS necesita para el CSV/JSON.
        return list(all_products.values())
    # ... (El resto de tu clase M_Products)

    # 8. GUARDAR ARCHIVO (NUEVO MÉTODO PARA EXPORTACIÓN DIRECTA)
    def SaveFileToDisk(self, content: str, filename: str) -> bool:
        """
        Guarda el contenido de un archivo (CSV/JSON) en la carpeta de Descargas del usuario.
        Devuelve True si tiene éxito, False en caso contrario.
        """
        try:
            # 1. Determinar la ruta de la carpeta de Descargas
            # Esto funciona en Windows/macOS/Linux
            # Si tienes problemas, puedes forzar una ruta fija como 'Data/'
            downloads_path = os.path.join(os.path.expanduser("~"), "Downloads")
            
            # 2. Crear la ruta completa del archivo
            full_path = os.path.join(downloads_path, filename)

            # 3. Escribir el contenido en el archivo
            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            print(f"Éxito: Archivo guardado en {full_path}")
            return True
        
        except Exception as e:
            print(f"ERROR: No se pudo guardar el archivo '{filename}'. Detalle: {e}")
            return False
    
    # 9. ARCHIVAR AGOTADOS (MÉTODO CORREGIDO)
    def ArchiveZeroStock(self) -> int:
        """
        Mueve todos los productos con stock cero (0) de productos.json a productos_sin_stock.json.
        Devuelve el número de productos archivados.
        """
        all_products: Dict[str, Any] = Methods.GetAll(ARCHIVO_DATOS)
        archived_count = 0
        products_to_archive = {}
        
        # 1. Identificar productos con stock 0
        ids_to_delete_from_active = []
        for product_id, product_data in all_products.items():
            try:
                stock = int(product_data.get('stock', 1)) 
                
                if stock == 0:
                    products_to_archive[product_id] = product_data
                    ids_to_delete_from_active.append(product_id)
            except (TypeError, ValueError):
                continue
                
        if not ids_to_delete_from_active:
            return 0 

        # 2. Mover a productos_sin_stock.json
        try:
            # CORRECCIÓN CLAVE: Iterar y usar Methods.AddOneDict
            for product_id, product_data in products_to_archive.items():
                Methods.AddOneDict(ARCHIVO_ARCHIVADOS, product_id, product_data) 
            
            # 3. Eliminar del inventario activo
            for product_id in ids_to_delete_from_active:
                Methods.Delete(ARCHIVO_DATOS, product_id)
                archived_count += 1
                
            return archived_count
            
        except Exception as e:
            # En caso de error al guardar en el archivo de archivados (ej. archivo no existe o permisos)
            print(f"ERROR CRÍTICO durante la archivación: {e}")
            return -1
    # 10. LISTAR POR STOCK BAJO (NUEVO MÉTODO)
    def GetLowStockItems(self, threshold: int) -> List[Dict[str, Any]]:
        """
        Devuelve una lista de productos cuyo stock es igual o menor al umbral dado.
        """
        all_products: Dict[str, Any] = Methods.GetAll(ARCHIVO_DATOS)
        low_stock_list: List[Dict[str, Any]] = []
        
        # 1. Convertir el umbral a entero
        try:
            threshold_int = int(threshold)
        except (ValueError, TypeError):
            return [] # Devuelve lista vacía si el umbral no es un número válido

        # 2. Iterar y filtrar
        for product_data in all_products.values():
            try:
                stock = int(product_data.get('stock', 0)) # Asumir 0 si el stock no existe o es inválido
                
                # Criterio de filtrado: Stock es MENOR O IGUAL al umbral
                if stock <= threshold_int:
                    low_stock_list.append(product_data)
                    
            except (TypeError, ValueError):
                # Ignorar productos con stock no numérico o inválido
                continue
                
        # Opcional: Ordenar la lista por stock de menor a mayor
        sorted_list = sorted(
            low_stock_list,
            key=lambda p: p.get('stock', 0)
        )
        
        return sorted_list