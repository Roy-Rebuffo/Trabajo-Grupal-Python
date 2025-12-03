// Archivo: js/archivar.js

document.addEventListener('DOMContentLoaded', () => {
    const archiveBtn = document.querySelector('.archive-btn');
    archiveBtn.addEventListener('click', handleArchive);
});

/**
 * Muestra un mensaje de estado (éxito, error, info).
 */
function displayMessage(message, type) {
    let display = document.getElementById('archive-message-display');
    if (!display) {
        // Crear el elemento si no existe
        display = document.createElement('div');
        display.id = 'archive-message-display';
        display.className = 'form-message';
        document.querySelector('.archive-card').appendChild(display);
    }
    display.textContent = message;
    display.className = `form-message message-${type}`;
    display.style.display = 'block';
}


/**
 * Maneja el evento de clic y llama a la función de Python.
 */
function handleArchive() {
    // Desactivar el botón para evitar doble clic
    const archiveBtn = document.querySelector('.archive-btn');
    archiveBtn.disabled = true;
    displayMessage("Procesando archivación...", "info");

    // Llama al método de Python: M_Products.ArchiveZeroStock()
    pywebview.api.products_ArchiveZeroStock()
        .then(archivedCount => {
            archiveBtn.disabled = false; // Reactivar el botón
            
            if (archivedCount === -1) {
                 displayMessage("❌ Error crítico: No se pudo escribir en el archivo de archivados. Revisa la consola de Python.", "error");
                 return;
            }
            
            if (archivedCount > 0) {
                displayMessage(`✅ Éxito: Se archivaron ${archivedCount} producto(s) con stock cero.`, "success");
            } else {
                displayMessage("ℹ️ No se encontró ningún producto con stock cero para archivar.", "info");
            }
        })
        .catch(err => {
            archiveBtn.disabled = false;
            console.error("ERROR al archivar:", err);
            displayMessage("❌ Error grave al comunicarse con el backend. Revisa la consola.", "error");
        });
}