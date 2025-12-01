// Estructura de datos para un producto
let productData = {"name":"","description":"","price":0.0,"stock":0};

function collectProductData() {
    productData.name = document.getElementById('name').value;
    productData.description = document.getElementById('description').value;
    productData.price = parseFloat(document.getElementById('price').value); 
    productData.stock = parseInt(document.getElementById('stock').value);
}

function SentData() {
    collectProductData();
    
    // Validar si los datos se recogieron correctamente antes de enviar
    if (!productData.name || isNaN(productData.price) || isNaN(productData.stock)) {
        alert("Por favor, rellene todos los campos correctamente.");
        return;
    }
    pywebview.api.products_AddProduct(productData)
    .then(() => {
        alert("Producto agregado correctamente.");
    })
    .catch(err => console.error("ERROR al añadir producto:", err));
}
