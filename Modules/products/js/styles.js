let barChart, pieChart;

/**
 * Inicializa los gráficos BarChart (Top 5 Products) y DoughnutChart (Price Distribution)
 */
function initCharts() {
    // Gráfico de Barras (Top 5 Products by Stock)
    const barCtx = document.getElementById('barChart').getContext('2d');
    barChart = new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: ['Laptop Pro', 'Smart Watch', 'Tablet X', 'Phone 12', 'Camera HD'],
            datasets: [{
                label: 'Stock Units',
                data: [245, 189, 167, 143, 128],
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)', // Azul
                    'rgba(20, 184, 166, 0.8)', // Teal
                    'rgba(139, 92, 246, 0.8)', // Morado
                    'rgba(236, 72, 153, 0.8)', // Rosa
                    'rgba(251, 146, 60, 0.8)' // Naranja
                ],
                borderColor: [
                    'rgba(59, 130, 246, 1)',
                    'rgba(20, 184, 166, 1)',
                    'rgba(139, 92, 246, 1)',
                    'rgba(236, 72, 153, 1)',
                    'rgba(251, 146, 60, 1)'
                ],
                borderWidth: 2,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0, 0, 0, 0.05)' }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });

    // Gráfico de Anillo (Price Distribution)
    const pieCtx = document.getElementById('pieChart').getContext('2d');
    pieChart = new Chart(pieCtx, {
        type: 'doughnut',
        data: {
            labels: ['Low ($0-$30)', 'Medium ($30-$70)', 'High ($70+)'],
            datasets: [{
                data: [35, 42, 23],
                backgroundColor: [
                    'rgba(20, 184, 166, 0.8)', // Teal
                    'rgba(59, 130, 246, 0.8)', // Azul
                    'rgba(139, 92, 246, 0.8)' // Morado
                ],
                borderColor: '#ffffff',
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        font: { size: 13 }
                    }
                }
            }
        }
    });
}

/**
 * Muestra una notificación temporal en la esquina superior derecha.
 * @param {string} message - El mensaje a mostrar.
 * @param {('info'|'success'|'warning')} type - El tipo para definir el color.
 */
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Configuración de estilos en línea (usando los colores originales del CSS)
    const bgColor = type === 'info' ? '#3b82f6' : 
                    type === 'success' ? '#14b8a6' : 
                    type === 'warning' ? '#ef4444' : '#64748b'; // Default
    
    notification.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        padding: 1rem 1.5rem;
        background: ${bgColor};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        font-weight: 600;
        /* Usar las animaciones definidas en styles.css */
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Desaparecer después de 2.5 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2500);
}

/**
 * Asigna los listeners de eventos a todos los botones de acción.
 */
function setupActionButtons() {
    // CRUD Básico
    document.getElementById('btn-list').addEventListener('click', () => {
        showNotification('Listando productos...', 'info');
    });
    document.getElementById('btn-update').addEventListener('click', () => {
        showNotification('Actualizando productos...', 'success');
    });
    document.getElementById('btn-delete').addEventListener('click', () => {
        showNotification('Preparando eliminación de productos...', 'warning');
    });
    document.getElementById('btn-add').addEventListener('click', () => {
        showNotification('Añadiendo nuevo artículo...', 'success');
    });

    // Acciones Adicionales
    document.getElementById('btn-details').addEventListener('click', () => {
        showNotification('Mostrando detalles de productos...', 'info');
    });
    document.getElementById('btn-archive').addEventListener('click', () => {
        showNotification('Archivando productos agotados...', 'info');
    });
    document.getElementById('btn-discount').addEventListener('click', () => {
        showNotification('Aplicando descuento a productos...', 'success');
    });
    document.getElementById('btn-export').addEventListener('click', () => {
        showNotification('Exportando datos...', 'info');
    });
    document.getElementById('btn-alerts').addEventListener('click', () => {
        showNotification('Configurando alertas de stock...', 'warning');
    });
    document.getElementById('btn-reorder').addEventListener('click', () => {
        showNotification('Reordenando inventario...', 'info');
    });
}

// Inicializar la aplicación cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    initCharts();
    setupActionButtons();
});

//Funcion para redirigir los botones a sus respectivos html
function setupActionButtons() {
    // ... otros botones ...

    // Este código dice: Cuando hagas click en el botón, cambia la URL de la ventana.
    document.getElementById('btn-list').addEventListener('click', () => {
        window.location.href = 'listar.html'; // ¡Aquí está el enlace!
    });
    document.getElementById('btn-update').addEventListener('click', () => {
        window.location.href = 'actualizar.html'; // ¡Aquí está el enlace!
    });
    document.getElementById('btn-alerts').addEventListener('click', () => {
        window.location.href = 'alertas.html'; // ¡Aquí está el enlace!
    });
    document.getElementById('btn-add').addEventListener('click', () => {
        window.location.href = 'añadir.html'; // ¡Aquí está el enlace!
    });
    document.getElementById('btn-archive').addEventListener('click', () => {
        window.location.href = 'archivar.html'; // ¡Aquí está el enlace!
    });
    document.getElementById('btn-delete').addEventListener('click', () => {
        window.location.href = 'borrar.html'; // ¡Aquí está el enlace!
    });
    document.getElementById('btn-discount').addEventListener('click', () => {
        window.location.href = 'descuento.html'; // ¡Aquí está el enlace!
    });
    document.getElementById('btn-details').addEventListener('click', () => {
        window.location.href = 'detalles.html'; // ¡Aquí está el enlace!
    });
    document.getElementById('btn-export').addEventListener('click', () => {
        window.location.href = 'exportarDatos.html'; // ¡Aquí está el enlace!
    });
    document.getElementById('btn-reorder').addEventListener('click', () => {
        window.location.href = 'reordenar.html'; // ¡Aquí está el enlace!
    });

    // ... el resto de botones ...
}