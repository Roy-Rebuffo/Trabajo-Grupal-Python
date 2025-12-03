// Archivo: js/reordenar.js

document.addEventListener('DOMContentLoaded', () => {
    // 1. Encontrar el botón y el contenedor de la lista
    const generateBtn = document.getElementById('generate-btn');
    const reorderListContainer = document.getElementById('reorder-list');
    
    // Asignar el listener al botón
    if (generateBtn) {
        generateBtn.addEventListener('click', generateReorderList);
    }

    // Cargar la lista al iniciar (opcional, para que siempre esté ahí)
    generateReorderList();
});

/**
 * Llama a la API de Python para obtener la lista de productos
 * ordenada por stock de menor a mayor y la muestra en el HTML.
 */
function generateReorderList() {
    const reorderListContainer = document.getElementById('reorder-list');
    reorderListContainer.innerHTML = '<p class="loading">Cargando lista de reabastecimiento...</p>';
    
    // Llamada a Python: M_Products.GetReorderList()
    pywebview.api.products_GetReorderList()
        .then(productsList => {
            if (!productsList || productsList.length === 0) {
                reorderListContainer.innerHTML = '<p class="info-message">No hay productos registrados en el inventario.</p>';
                return;
            }

            // 2. Construir el HTML de la lista
            let htmlContent = '<div class="product-grid">';

            productsList.forEach(product => {
                // Determinar la clase de stock para estilo visual
                let stockClass = 'stock-high';
                if (product.stock < 5) {
                    stockClass = 'stock-low';
                } else if (product.stock < 15) {
                    stockClass = 'stock-medium';
                }
                
                htmlContent += `
                    <div class="product-item ${stockClass}">
                        <div class="product-header">
                            <span class="product-id">ID: ${product.id}</span>
                            <span class="product-stock ${stockClass}">Stock: ${product.stock}</span>
                        </div>
                        <h3 class="product-name">${product.name}</h3>
                        <p class="product-description">${product.description || 'Sin descripción.'}</p>
                        <p class="product-price">Precio: ${product.price.toFixed(2)} €</p>
                        ${product.stock < 10 ? '<span class="reorder-flag">🚨 ¡PEDIR!</span>' : ''}
                    </div>
                `;
            });
            
            htmlContent += '</div>';

            // 3. Insertar el HTML en el contenedor
            reorderListContainer.innerHTML = htmlContent;
        })
        .catch(err => {
            console.error("ERROR al generar la lista de reabastecimiento:", err);
            reorderListContainer.innerHTML = '<p class="error-message">❌ Error al cargar los datos. Revisa la consola de Python.</p>';
        });
}