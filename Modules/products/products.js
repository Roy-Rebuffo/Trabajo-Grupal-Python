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

// Función para listar los productos (OBLIGATORIO 2)
function ListProducts() {
    pywebview.api.products_GetProducts()
    .then(data => {
        console.log("Lista de Productos:", data);
        // Aquí deberías añadir lógica para mostrar 'data' en tu HTML
    })
    .catch(err => console.error("ERROR al listar productos:", err));
}

    // Función para obtener la estadística (OBLIGATORIO 3)
// function GetStatistics() {
//     pywebview.api.products_GetTopStocked(3) // Obtener los 3 con más stock
//     .then(data => {
//         console.log("Top 3 Productos con más Stock:", data);
//         // Lógica para mostrar los resultados en HTML
//     })
//     .catch(err => console.error("ERROR al obtener estadísticas:", err));
// }