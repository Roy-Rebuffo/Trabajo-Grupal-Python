// Variable global para almacenar el ID que estamos editando
let currentProductId = null;

/**
 * 1. Busca el producto por ID y rellena los campos del formulario.
 */
function SearchProduct() {
    const productIdInput = document.getElementById('product-id');
    const productId = productIdInput.value.trim();
    
    // Referencias a los campos que vamos a rellenar/habilitar
    const stockInput = document.getElementById('product-stock');
    const priceInput = document.getElementById('product-price');
    const saveButton = document.getElementById('save-btn'); // El nuevo ID del botón

    // Limpiar y deshabilitar por defecto
    stockInput.value = 0;
    priceInput.value = 0.00;
    stockInput.disabled = true;
    priceInput.disabled = true;
    saveButton.disabled = true;

    if (!productId) {
        alert("Por favor, introduce un ID de producto.");
        return;
    }

    // Llamada a Python: M_Products.GetProductById()
    pywebview.api.products_GetProductById(productId)
        .then(productData => {
            if (productData) {
                // Éxito: Producto encontrado
                currentProductId = productId;
                
                // Rellenar los campos con los datos actuales
                stockInput.value = productData.stock;
                priceInput.value = productData.price;

                // Habilitar la edición y el botón de guardar
                stockInput.disabled = false;
                priceInput.disabled = false;
                saveButton.disabled = false;
                alert(`Producto ID ${productId} cargado. Modifica y guarda.`);

            } else {
                // Fracaso: Producto no encontrado
                alert(`Error: No se encontró el producto con ID ${productId}.`);
                currentProductId = null;
            }
        })
        .catch(err => {
            console.error("ERROR al buscar producto:", err);
            alert("Ocurrió un error al intentar buscar el producto.");
        });
}
/**
 * 2. Recoge los nuevos datos de los campos y los envía a Python para guardar.
 */
function UpdateProductData() {
    // Si no hemos cargado un producto (o la búsqueda falló), cancelamos
    if (!currentProductId) {
        alert("Primero debes buscar un producto válido para actualizar.");
        return;
    }
    
    // 1. Recoger los nuevos valores del formulario
    const newStock = parseInt(document.getElementById('product-stock').value);
    const newPrice = parseFloat(document.getElementById('product-price').value);

    // 2. Crear el objeto de datos a enviar
    // NOTA: Tu CRUD.py.Update solo actualiza las claves que recibe.
    const new_data = {
        'stock': newStock,
        'price': newPrice
    };

    // 3. Llamada a Python: M_Products.UpdateProduct(ID, new_data)
    pywebview.api.products_UpdateProduct(currentProductId, new_data)
        .then(() => {
            alert(`✅ Producto ID ${currentProductId} actualizado correctamente.`);
            
            // Opcional: Deshabilitar los campos después de guardar
            document.getElementById('product-stock').disabled = true;
            document.getElementById('product-price').disabled = true;
            document.getElementById('save-btn').disabled = true;
            currentProductId = null;

        })
        .catch(err => {
            console.error("ERROR al actualizar producto:", err);
            alert("Ocurrió un error al guardar los cambios.");
        });
}