// Archivo: js/descuento.js

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar el input de alcance
    toggleScopeInput(); 
    
    const form = document.getElementById('discount-form');
    form.addEventListener('submit', handleDiscountSubmission);
});

/**
 * Muestra u oculta/cambia la etiqueta del campo de entrada
 * según lo seleccionado en el dropdown 'Aplicar a'.
 */
function toggleScopeInput() {
    const scope = document.getElementById('discount-scope').value;
    const inputContainer = document.getElementById('scope-input-container');
    const inputField = document.getElementById('scope-value-input');
    const inputLabel = document.getElementById('scope-value-label');

    if (scope === 'single') {
        inputLabel.textContent = 'ID del Producto:';
        inputField.placeholder = 'Ej: PR-0001';
        inputField.required = true;
        inputContainer.style.display = 'block';
    } else if (scope === 'category') {
        inputLabel.textContent = 'Nombre de la Categoría:';
        inputField.placeholder = 'Ej: Electrónica, Ropa, etc.';
        inputField.required = true;
        inputContainer.style.display = 'block';
    } else { // scope === 'all'
        inputField.required = false;
        inputContainer.style.display = 'none';
        displayMessage("Se aplicará el descuento a TODOS los productos del inventario.", "info");
    }
}

/**
 * Muestra un mensaje de estado (éxito, error, info) al usuario.
 * @param {string} message - El mensaje a mostrar.
 * @param {string} type - El tipo de mensaje ('success', 'error', 'info').
 */
function displayMessage(message, type) {
    const display = document.getElementById('message-display');
    display.textContent = message;
    display.className = `form-message message-${type}`;
    display.style.display = 'block';
}

/**
 * Maneja el envío del formulario, recolecta datos y llama a Python.
 * @param {Event} event - El evento de envío del formulario.
 */
function handleDiscountSubmission(event) {
    event.preventDefault(); // Evita el envío estándar del formulario
    
    displayMessage("", ""); // Limpia mensajes anteriores

    const percent = parseInt(document.getElementById('discount-percent').value);
    const scope = document.getElementById('discount-scope').value;
    let scopeValue = '';

    if (scope !== 'all') {
        scopeValue = document.getElementById('scope-value-input').value.trim();
        if (!scopeValue) {
            displayMessage("Debes especificar un ID o una Categoría.", "error");
            return;
        }
    }
    
    // Validaciones básicas de porcentaje
    if (percent <= 0 || percent > 100) {
        displayMessage("El porcentaje debe ser entre 1 y 100.", "error");
        return;
    }
    
    displayMessage(`Aplicando ${percent}% de descuento...`, "info");

    // Llama a la función de Python: M_Products.ApplyDiscount(percent, scope, scopeValue)
    pywebview.api.products_ApplyDiscount(percent, scope, scopeValue)
        .then(updatedCount => {
            if (updatedCount > 0) {
                const scopeText = scope === 'all' ? 'el inventario completo' : 
                                  scope === 'single' ? `el producto con ID '${scopeValue}'` : 
                                  `la categoría '${scopeValue}'`;
                
                displayMessage(`✅ Éxito: Descuento del ${percent}% aplicado a ${updatedCount} producto(s) en ${scopeText}.`, "success");
            } else {
                let infoMessage = `Se intentó aplicar el descuento, pero no se encontró ningún producto que coincidiera.`;
                if (scope === 'single') {
                    infoMessage += ` Verifica que el ID '${scopeValue}' sea correcto.`;
                } else if (scope === 'category') {
                    infoMessage += ` Verifica que la categoría '${scopeValue}' exista.`;
                }
                displayMessage(infoMessage, "error");
            }
        })
        .catch(err => {
            console.error("ERROR al aplicar descuento:", err);
            displayMessage("❌ Error grave al comunicarse con el backend. Revisa la consola de Python.", "error");
        });
}