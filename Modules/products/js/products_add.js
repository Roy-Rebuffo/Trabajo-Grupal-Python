let productData = {"name":"","description":"","price":0.0,"stock":0};

function collectProductData() {
    // Asegúrate de que estos IDs coinciden EXACTAMENTE con el HTML
    productData.name = document.getElementById('new-name').value;
    
    // CORRECCIÓN: Tu HTML dice 'new-desc', no 'new-description'
    let descInput = document.getElementById('new-desc'); 
    productData.description = descInput ? descInput.value : ""; // Evita error si es null

    productData.price = parseFloat(document.getElementById('new-price').value); 
    productData.stock = parseInt(document.getElementById('new-stock').value);

    console.log("Datos recogidos:", productData); // Para ver en la consola si funciona
}

function SentData() {
    collectProductData();
    
    // Validaciones
    if (!productData.name || !productData.description || isNaN(productData.price) || isNaN(productData.stock)) {
        alert("Por favor, rellene todos los campos correctamente.");
        return;
    }

    // Llamada a Python
    pywebview.api.products_AddProduct(productData)
    .then((response) => {
        // Asumiendo que Python devuelve algo, o simplemente termina
        alert("Producto agregado correctamente.");
        
        // Opcional: Limpiar el formulario después de guardar
        document.getElementById('add-product-form').reset();
        
        // Opcional: Redirigir al listado
        // window.location.href = 'products_module.html';
    })
    .catch(err => {
        console.error("ERROR al añadir producto:", err);
        alert("Error al guardar: " + err);
    });
}