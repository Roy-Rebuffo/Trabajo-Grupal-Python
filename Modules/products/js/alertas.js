// Archivo: js/alertas.js

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('search-form');
    // Usamos 'submit' para que funcione también con la tecla Enter
    form.addEventListener('submit', handleStockSearch); 
    
    // Opcional: Llamar a la búsqueda al cargar la página con el valor por defecto (5)
    handleStockSearch(null); 
});

/**
 * Genera la tabla HTML para mostrar la lista de productos.
 * @param {Array<Object>} productsList - Lista de productos filtrados.
 * @param {number} threshold - El valor del umbral usado para la búsqueda.
 */
function renderProductTable(productsList, threshold) {
    const container = document.getElementById('results-container');

    if (productsList.length === 0) {
        container.innerHTML = `<p class="message-info">✅ No se encontró ningún producto con stock igual o menor a ${threshold}.</p>`;
        return;
    }

    let tableHTML = `
        <p class="message-success">Mostrando ${productsList.length} producto(s) con stock igual o menor a ${threshold}.</p>
        <table class="alert-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Stock</th>
                    <th>Categoría</th>
                    <th>Precio</th>
                </tr>
            </thead>
            <tbody>
    `;

    productsList.forEach(product => {
        const stock = parseInt(product.stock) || 0;
        const rowClass = stock === 0 ? 'stock-cero' : '';
        
        tableHTML += `
            <tr class="${rowClass}">
                <td>${product.id || '-'}</td>
                <td>${product.name || 'N/A'}</td>
                <td>${stock}</td>
                <td>${product.category || 'Sin Cat.'}</td>
                <td>$${(product.price || 0).toFixed(2)}</td>
            </tr>
        `;
    });

    tableHTML += `
            </tbody>
        </table>
    `;
    
    container.innerHTML = tableHTML;
}


/**
 * Maneja el envío del formulario, recolecta datos y llama a Python.
 * @param {Event | null} event - El evento de envío del formulario (puede ser null al cargar).
 */
function handleStockSearch(event) {
    if (event) {
        event.preventDefault(); // Evita el envío estándar del formulario
    }

    const thresholdInput = document.getElementById('alert-threshold');
    const threshold = parseInt(thresholdInput.value);

    // Validación básica
    if (isNaN(threshold) || threshold < 0) {
        document.getElementById('results-container').innerHTML = 
            `<p class="message-error">❌ Por favor, introduce un umbral de stock válido (número positivo).</p>`;
        return;
    }
    
    // Muestra un mensaje de carga
    document.getElementById('results-container').innerHTML = 
        `<p class="message-info">Buscando productos con stock <= ${threshold}...</p>`;

    // Llama a la función de Python: M_Products.GetLowStockItems(threshold)
    pywebview.api.products_GetLowStockItems(threshold)
        .then(productsList => {
            // Renderiza los resultados
            renderProductTable(productsList, threshold);
        })
        .catch(err => {
            console.error("ERROR al buscar alertas de stock:", err);
            document.getElementById('results-container').innerHTML = 
                `<p class="message-error">❌ Error al comunicarse con el backend. Revisa la consola de Python.</p>`;
        });
}