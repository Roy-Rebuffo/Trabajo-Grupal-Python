/**
 * Lógica para borrar un producto (usando el ID del HTML de borrado).
 */
function DeleteProductData() {
    // 1. Recoger el ID del campo de entrada
    const productIdInput = document.getElementById('delete-product-id');
    const productId = productIdInput.value.trim();

    // 2. Validación básica
    if (!productId) {
        alert("Por favor, introduce el ID del producto a eliminar.");
        return;
    }
    
    // 3. Petición de confirmación al usuario (Paso de seguridad)
    const confirmed = confirm(`¿Estás SEGURO de que deseas eliminar permanentemente el producto con ID: ${productId}?`);
    
    if (confirmed) {
        // 4. Llamar al método Python
        // La API de pywebview llamará a M_Products.py -> DeleteProduct(productId)
        pywebview.api.products_DeleteProduct(productId)
            .then(() => {
                alert(`Producto con ID ${productId} eliminado correctamente.`);
                
                // Opcional: Limpiar el campo de entrada después de la eliminación exitosa
                productIdInput.value = '';
                
                // Opcional: Redirigir a la lista de productos
                // window.location.href='productos_listar.html'; 
            })
            .catch(err => {
                console.error("ERROR al eliminar producto:", err);
                // NOTA: Tu CRUD.py imprime el error, pero no lo devuelve. 
                // Si la eliminación falla (ej. ID no existe), la respuesta del CRUD.py debe manejar el feedback.
                alert(`Error al eliminar el producto: Asegúrate de que el ID '${productId}' existe.`);
            });
    } else {
        alert("Eliminación cancelada.");
    }
}