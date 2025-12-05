// Función para cargar todos los KPIs y elementos del dashboard
function loadDashboard() {
    // Si pywebview.api no existe, estamos fuera del entorno pywebview
    if (typeof pywebview === 'undefined' || !pywebview.api) {
        console.error("Pywebview API not available. Dashboard won't load data.");
        return;
    }

    // Función auxiliar para formatear precio de manera segura
    const formatPrice = (price) => {
        const p = parseFloat(price);
        return isNaN(p) ? '$0.00' : `$${p.toFixed(2)}`;
    }

    // 1️⃣ KPIs: Total Products, Total Stock, Average Price
    // Se usa products_GetKpis para coincidir con la lógica de app.py
    pywebview.api.products_GetKpis()
    .then(data => {
        console.log("KPI Data received:", data);
        document.getElementById('kpi-total-products').innerText = data.total_products;
        document.getElementById('kpi-total-stock').innerText = data.total_stock;
        document.getElementById('kpi-avg-price').innerText = formatPrice(data.average_price);
    })
    .catch(error => {
        console.error("Error fetching KPIs:", error);
    });

    // 2️⃣ Top 5 productos por stock (products_GetTopStocked ahora existe en Python)
    pywebview.api.products_GetTopStocked(5)
        .then(products => {
            if (!products || products.length === 0) {
                console.log("No products data for bar chart.");
                // Opcional: mostrar un mensaje "No hay datos" en lugar del gráfico vacío
                return;
            }

            const ctx = document.getElementById('barChart').getContext('2d');
            const labels = products.map(p => p.name);
            const stockData = products.map(p => p.stock);
            
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Stock',
                        data: stockData,
                        backgroundColor: 'rgba(54, 162, 235, 0.6)'
                    }]
                },
                options: { responsive: true, plugins: { legend: { display: false } } }
            });
        })
        .catch(error => {
            console.error("Error fetching Top Stocked products:", error);
        });

    // 3️⃣ Price distribution
    pywebview.api.products_GetPriceDistribution()
        .then(dist => {
            const total = dist.low + dist.medium + dist.high;
            if (total === 0) {
                console.log("No price distribution data.");
                return;
            }

            const ctx = document.getElementById('pieChart').getContext('2d');
            new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: ['Low ($0-5)', 'Medium ($6-15)', 'High ($16+)'],
                    datasets: [{
                        data: [dist.low, dist.medium, dist.high],
                        backgroundColor: ['#2ecc71','#3498db','#9b59b6']
                    }]
                },
                options: { responsive: true }
            });
        })
        .catch(error => {
            console.error("Error fetching price distribution:", error);
        });

    // 4️⃣ Latest product
    pywebview.api.products_GetLatestProduct()
    .then(product => {
        if (!product || Object.keys(product).length === 0) {
            document.getElementById('latest-name').innerText = 'No Data';
            document.getElementById('latest-stock').innerText = 'N/A';
            document.getElementById('latest-price').innerText = formatPrice(0);
            document.getElementById('latest-description').innerText = 'N/A';
            return;
        }

        document.getElementById('latest-name').innerText = product.name || 'N/A';
        document.getElementById('latest-stock').innerText = `${product.stock || 0} units`;
        document.getElementById('latest-price').innerText = formatPrice(product.price);
        document.getElementById('latest-description').innerText = product.description || 'N/A';
    })
    .catch(error => {
        console.error("Error fetching latest product:", error);
    });
}

// Ejecutar al cargar el dashboard
// Nota: En pywebview, es mejor usar la propiedad "onApiAvailable" o un retraso
// para asegurar que la API esté lista. Usaremos un chequeo simple por ahora.
if (window.pywebview && window.pywebview.api) {
    loadDashboard();
} else {
    // Si no está listo, esperamos
    window.addEventListener('pywebviewready', loadDashboard);
    window.onload = loadDashboard; // Fallback simple
}

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