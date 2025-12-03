// Función para listar los productos (OBLIGATORIO 1)
// 1. Obtener la referencia a la tabla donde se pintarán los productos
const productTableBody = document.getElementById('productos-body');

function ListProducts() {
    pywebview.api.products_GetProducts()
    .then(data => {
        // 'data' es un DICCIONARIO: {"PR-0001": {...}, "PR-0002": {...}}
        
        // 1. Convertir el diccionario a un ARRAY de objetos
        // Esto funciona porque GetProducts devuelve el diccionario completo.
        const productsArray = Object.values(data); 

        // 2. Limpiar el contenido actual de la tabla
        productTableBody.innerHTML = ''; 

        // 3. Iterar sobre el array y pintar cada producto
        productsArray.forEach(product => {
            // Se asume que 'product' es un objeto como: {id: "PR-0001", name: "Kativa", ...}
            const row = productTableBody.insertRow();
            
            // Insertar celdas (td) en la fila
            row.insertCell().textContent = product.id;
            row.insertCell().textContent = product.name;
            row.insertCell().textContent = product.description;
            // Formatear precio a 2 decimales
            row.insertCell().textContent = `$${product.price.toFixed(2)}`; 
            row.insertCell().textContent = product.stock;
        });
        
    })
    .catch(err => {
        console.error("ERROR al listar productos:", err);
        productTableBody.innerHTML = '<tr><td colspan="5">Error al cargar los productos.</td></tr>';
    });
}
