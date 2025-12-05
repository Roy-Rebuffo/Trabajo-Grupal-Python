// Archivo: js/detalles.js

/**
 * Función para resetear los campos de detalles a su estado inicial.
 */
function resetDetails() {
    document.getElementById('detail-name').textContent = '[Nombre del Producto]';
    document.getElementById('detail-id').textContent = 'N/A';
    document.getElementById('detail-stock').textContent = 'N/A';
    document.getElementById('detail-category').textContent = 'N/A';
    document.getElementById('detail-price').textContent = 'N/A';
    document.getElementById('detail-description').textContent = 'N/A';
    document.getElementById('detail-last-update').textContent = 'N/A';
    
    // Ocultar la tarjeta de detalles
    document.getElementById('product-details-display').style.display = 'none';
}

// Ocultar la tarjeta al cargar la página (para que no muestre "N/A" por defecto)
document.addEventListener('DOMContentLoaded', resetDetails);

/**
 * Busca un producto por ID/Nombre usando la API de Python y rellena los campos.
 */
function SearchProductDetails() {
    const productIdInput = document.getElementById('search-product-id');
    const productId = productIdInput.value.trim();
    
    // Resetear detalles antes de la nueva búsqueda
    resetDetails(); 

    if (!productId) {
        alert("Por favor, introduce el ID o Nombre del producto a buscar.");
        return;
    }
    
    // NOTA: Asumimos que la búsqueda por ID es suficiente. Si necesitas buscar por nombre, 
    // tendrías que crear un nuevo método en Python (M_Products.GetProductByName).
    // Usaremos GetProductById, ya que el ID es la clave principal.

    // Llamada a Python: M_Products.GetProductById(productId)
    pywebview.api.products_GetProductById(productId)
        .then(productData => {
            if (productData) {
                // Éxito: Producto encontrado. Rellenar los detalles.
                
                // Formateo de datos
                const formattedPrice = parseFloat(productData.price).toFixed(2) + ' €';
                const formattedStock = parseInt(productData.stock);
                
                document.getElementById('detail-name').textContent = productData.name;
                document.getElementById('detail-id').textContent = productData.id;
                document.getElementById('detail-stock').textContent = formattedStock;
                document.getElementById('detail-category').textContent = productData.category || 'Electrónica'; // Valor por defecto si no existe
                document.getElementById('detail-price').textContent = formattedPrice;
                document.getElementById('detail-description').textContent = productData.description || 'No disponible.';
                
                // Placeholder para la última actualización (usa la fecha actual si no existe el campo)
                document.getElementById('detail-last-update').textContent = productData.last_update || new Date().toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' });

                // Mostrar la tarjeta
                document.getElementById('product-details-display').style.display = 'block';

            } else {
                // Fracaso: Producto no encontrado
                alert(`Error: No se encontró el producto con ID/Nombre: ${productId}.`);
                // Mantener la tarjeta oculta
            }
        })
        .catch(err => {
            console.error("ERROR al buscar detalles del producto:", err);
            alert("Ocurrió un error al intentar buscar el producto.");
            // Mantener la tarjeta oculta
        });
}