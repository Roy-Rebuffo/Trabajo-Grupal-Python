// Archivo: js/exportar.js

const LOW_STOCK_THRESHOLD = 10; // Definimos un umbral para "Bajo Stock"

/**
 * Filtra los datos de productos según la opción seleccionada.
 *
 * @param {Array<Object>} productsList - Lista completa de productos.
 * @param {string} filterOption - Opción de filtrado ('all', 'active', 'low-stock').
 * @returns {Array<Object>} Lista filtrada de productos.
 */
function filterProducts(productsList, filterOption) {
    switch (filterOption) {
        case 'active':
            // Suponiendo que el producto tiene una propiedad 'active' (booleana)
            // Si tu JSON no tiene 'active', se asume que todos están activos
            return productsList.filter(p => p.active !== false); 
        case 'low-stock':
            // Definimos bajo stock como menos de LOW_STOCK_THRESHOLD
            return productsList.filter(p => parseInt(p.stock) < LOW_STOCK_THRESHOLD);
        case 'all':
        default:
            return productsList;
    }
}

/**
 * Convierte una lista de objetos a formato CSV.
 *
 * @param {Array<Object>} items - Lista de diccionarios/objetos.
 * @returns {string} El contenido del archivo CSV.
 */
function convertToCSV(items) {
    if (items.length === 0) {
        return "";
    }

    // Obtener todas las claves del primer objeto para las cabeceras
    const header = Object.keys(items[0]);
    const csvHeader = header.join(',');

    // Mapear cada objeto a una fila de CSV
    const csvRows = items.map(item => {
        return header.map(fieldName => {
            let value = item[fieldName];
            if (value === null || typeof value === 'undefined') {
                value = '';
            } else if (typeof value === 'object') {
                // Si es un objeto complejo (ej. lista), lo convertimos a string JSON
                value = JSON.stringify(value); 
            }
            
            // Escapar comillas dobles y encerrar en comillas si contiene comas o saltos de línea
            value = String(value).replace(/"/g, '""');
            if (value.includes(',') || value.includes('\n')) {
                value = `"${value}"`;
            }
            return value;
        }).join(',');
    });

    return [csvHeader, ...csvRows].join('\n');
}

/**
 * Inicia la descarga del archivo generado (CSV o JSON).
 *
 * @param {string} content - El contenido del archivo (CSV o JSON string).
 * @param {string} filename - Nombre del archivo incluyendo la extensión.
 * @param {string} mimeType - MIME type del archivo.
 */
function downloadFile(content, filename, mimeType) {
    try {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url); // Liberar la URL del objeto Blob
        
        alert(`✅ Archivo '${filename}' generado y descargado con éxito.`);
        
    } catch (e) {
        console.error("Error al generar o descargar el archivo:", e);
        alert("❌ Error: No se pudo iniciar la descarga del archivo. Revisa la consola.");
    }
}


/**
 * Función principal que orquesta la exportación de datos.
 */
function ExportData() {
    const format = document.getElementById('export-format').value;
    const filter = document.getElementById('export-data').value;
    
    // 1. Obtener todos los productos de Python como lista
    pywebview.api.products_GetAllProductsAsList()
        .then(productsList => {
            if (!productsList || productsList.length === 0) {
                alert("Inventario vacío. No hay datos para exportar.");
                return;
            }

            // 2. Filtrar los productos
            const filteredData = filterProducts(productsList, filter);

            if (filteredData.length === 0) {
                alert("No se encontraron productos que coincidan con el filtro seleccionado.");
                return;
            }

            let fileContent;
            let filename;
            // Eliminamos 'mimeType' ya que solo se usa para la descarga JS original
            
            // 3. Convertir al formato deseado
            if (format === 'json') {
                fileContent = JSON.stringify(filteredData, null, 2); // 2 para una indentación legible
                filename = `inventario_${filter}_${new Date().toISOString().slice(0, 10)}.json`;
            } else if (format === 'csv') {
                fileContent = convertToCSV(filteredData);
                filename = `inventario_${filter}_${new Date().toISOString().slice(0, 10)}.csv`;
            }

            // 4. Descargar el archivo: Se pasa el contenido y nombre a Python.
            // pywebview.api.products_SaveFileToDisk manejará el guardado en el disco.
            pywebview.api.products_SaveFileToDisk(fileContent, filename)
                .then(success => {
                    if (success) {
                        alert(`✅ Archivo '${filename}' generado y guardado con éxito. (Guardado por Python)`);
                    } else {
                        alert(`❌ Error: Python no pudo guardar el archivo '${filename}'.`);
                    }
                })
                .catch(err => {
                    console.error("ERROR al guardar en disco:", err);
                    alert("❌ Error grave al comunicarse con el backend para guardar el archivo.");
                });

        }) // <--- Asegúrate de que este paréntesis cierra el .then(productsList => {
        .catch(err => {
            console.error("ERROR en la exportación:", err);
            alert("Ocurrió un error al obtener los datos de Python para exportar.");
        });
}