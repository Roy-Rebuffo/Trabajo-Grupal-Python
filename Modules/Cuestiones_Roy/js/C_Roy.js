// ========================================================
// C_Roy.js
// ========================================================

// --------------------------------------------------------
// UTILIDADES DE CANVAS (Mantenidas de tu compañero)
// --------------------------------------------------------

function clearCanvas(ctx, canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// ---------------------------
// 📊 GRÁFICO DE BARRAS VERTICAL
// ---------------------------
function drawBarChart(canvasId, labels, values, title="") {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return; // Validación
    const ctx = canvas.getContext("2d");
    clearCanvas(ctx, canvas);

    const width = canvas.width;
    const height = canvas.height;

    const maxValue = Math.max(...values);
    const barWidth = width / (values.length * 1.5);
    const margin = barWidth / 2;

    ctx.font = "18px Arial";
    ctx.fillText(title, 10, 25);

    values.forEach((value, i) => {
        const barHeight = (value / maxValue) * (height - 80);
        const x = i * (barWidth + margin) + margin;
        const y = height - barHeight - 30;

        ctx.fillStyle = "#4A90E2";
        ctx.fillRect(x, y, barWidth, barHeight);

        ctx.fillStyle = "#000";
        ctx.font = "12px Arial";
        ctx.fillText(labels[i], x, height - 10);

        ctx.fillText(value.toFixed(2), x, y - 5); // Usamos toFixed(2) para valores monetarios
    });
}

// ---------------------------
// 📊 GRÁFICO DE BARRAS HORIZONTAL
// ---------------------------
function drawHorizontalBarChart(canvasId, labels, values, title="") {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    clearCanvas(ctx, canvas);

    const width = canvas.width;
    const height = canvas.height;

    const maxValue = Math.max(...values);
    const barHeight = height / (values.length * 1.5);
    const margin = barHeight / 2;

    ctx.font = "18px Arial";
    ctx.fillText(title, 10, 25);

    values.forEach((value, i) => {
        const barWidth = (value / maxValue) * (width - 150);
        const y = i * (barHeight + margin) + margin + 30;

        ctx.fillStyle = "#E26A4A";
        ctx.fillRect(150, y, barWidth, barHeight);

        ctx.fillStyle = "#000";
        ctx.font = "14px Arial";
        ctx.fillText(labels[i], 10, y + barHeight - 5);

        ctx.fillText(value.toFixed(2), 160 + barWidth, y + barHeight - 5); // Usamos toFixed(2)
    });
}

// ---------------------------
// 🥧 GRÁFICO DE PASTEL
// ---------------------------
function drawPieChart(canvasId, labels, values, title="") {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    clearCanvas(ctx, canvas);

    const total = values.reduce((a,b) => a + b, 0);
    let startAngle = 0;

    ctx.font = "18px Arial";
    ctx.fillText(title, 10, 25);

    const colors = ["#4A90E2", "#E26A4A", "#50C878", "#9B59B6", "#F4D03F", "#5DADE2", "#C39BD3"];

    values.forEach((value, i) => {
        const sliceAngle = (value / total) * Math.PI * 2;

        ctx.beginPath();
        ctx.moveTo(canvas.width/2, canvas.height/2);
        ctx.arc(canvas.width/2, canvas.height/2, 120, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();

        const midAngle = startAngle + sliceAngle/2;
        const labelX = canvas.width/2 + Math.cos(midAngle) * 150;
        const labelY = canvas.height/2 + Math.sin(midAngle) * 150;

        ctx.fillStyle = "#000";
        ctx.font = "14px Arial";
        // Muestra el nombre y el porcentaje
        const percent = ((value / total) * 100).toFixed(1);
        ctx.fillText(`${labels[i]} (${percent}%)`, labelX - 20, labelY);

        startAngle += sliceAngle;
    });
}


// --------------------------------------------------------
// 🚀 FUNCIÓN PRINCIPAL DE ROY
// --------------------------------------------------------

async function loadStatsRoy() {
    const resultsDiv = document.getElementById("results_roy");
    resultsDiv.innerHTML = "<p>Cargando datos del Grupo 2 desde Python...</p>";

    try {
        // -------------------------------------------------------------------
        // 1. LLAMADAS A LA API DE PYTHON (Usando el formato aplacado C_Roy_METODO)
        // -------------------------------------------------------------------
        const rankingFacturacion = await window.pywebview.api.C_Roy_ranking_productos_por_facturacion();
        const serviciosPorEmpleado = await window.pywebview.api.C_Roy_servicios_vendidos_por_empleado();
        const stockReposicion = await window.pywebview.api.C_Roy_stock_vendido_y_reposicion();
        const comparativaPS = await window.pywebview.api.C_Roy_comparativa_productos_vs_servicios();
        const productoPorCiudad = await window.pywebview.api.C_Roy_producto_mas_vendido_por_ciudad();
        const serviciosDuracion = await window.pywebview.api.C_Roy_servicios_por_duracion_acumulada();
        const margenEstimado = await window.pywebview.api.C_Roy_margen_estimado_por_tipo();

        let html = "";

        // -------------------------------------------
        // 8) RANKING DE PRODUCTOS POR FACTURACIÓN
        // -------------------------------------------
        html += `
        <h2>8) Ranking de productos con mayor facturación</h2>
        <canvas id="chart_facturacion" width="800" height="300"></canvas>
        <table border="1" cellpadding="5">
            <tr><th>ID</th><th>Producto</th><th>Facturación (€)</th></tr>
            ${rankingFacturacion.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2].toFixed(2)} €</td></tr>`).join("")}
        </table>
        `;
        let labelsFact = rankingFacturacion.map(r => r[1]);
        let valoresFact = rankingFacturacion.map(r => r[2]);
        

        // -------------------------------------------
        // 9) SERVICIOS MÁS VENDIDOS POR EMPLEADO
        // -------------------------------------------
        const empleadoKeys = Object.keys(serviciosPorEmpleado);
        const empleadoTableRows = empleadoKeys.map(nombreEmpleado => {
            const servicios = serviciosPorEmpleado[nombreEmpleado];
            const listaServicios = servicios.map(s => `${s[0]} (${s[1]} uds)`).join(", ");
            return `<tr><td>${nombreEmpleado}</td><td>${listaServicios}</td></tr>`;
        }).join("");

        html += `
        <h2>9) Servicios más vendidos por empleado</h2>
        <table border="1" cellpadding="5">
            <tr><th>Empleado</th><th>Ranking de Servicios (uds)</th></tr>
            ${empleadoTableRows}
        </table>
        `;
        
        // No se recomienda gráfico simple ya que los datos son anidados (1 empleado vs muchos servicios)


        // -------------------------------------------
        // 10) STOCK VENDIDO Y REPOSICIÓN NECESARIA
        // -------------------------------------------
        const stockData = Object.values(stockReposicion);
        const stockTableRows = stockData.map(d => `
            <tr>
                <td>${d.nombre}</td>
                <td>${d.stock_actual}</td>
                <td>${d.cantidad_vendida}</td>
                <td style="color:${d.reposicion_sugerida > 0 ? 'red' : 'green'}; font-weight:bold;">${d.reposicion_sugerida}</td>
            </tr>
        `).join("");

        html += `
        <h2>10) Relación entre stock vendido y reposición necesaria</h2>
        <table border="1" cellpadding="5">
            <tr><th>Producto</th><th>Stock Actual</th><th>Vendida</th><th>Reposición Sugerida</th></tr>
            ${stockTableRows}
        </table>
        `;

        // -------------------------------------------
        // 11) COMPARATIVA PRODUCTOS VS SERVICIOS
        // -------------------------------------------
        html += `
        <h2>11) Comparativa Productos vs Servicios (Facturación Base)</h2>
        <canvas id="pie_comparativa" width="400" height="300"></canvas>
        `;
        let labelsComp = ["Productos", "Servicios"];
        let valoresComp = [comparativaPS.productos, comparativaPS.servicios];


        // -------------------------------------------
        // 12) PRODUCTO MÁS VENDIDO POR CIUDAD
        // -------------------------------------------
        const ciudadKeys = Object.keys(productoPorCiudad);
        const ciudadTableRows = ciudadKeys.map(ciudad => {
            const data = productoPorCiudad[ciudad];
            const nombre = data ? data.nombre_producto : 'N/A';
            const cantidad = data ? data.cantidad : 0;
            return `<tr><td>${ciudad}</td><td>${nombre}</td><td>${cantidad}</td></tr>`;
        }).join("");
        
        html += `
        <h2>12) Producto más vendido según ciudad del cliente</h2>
        <table border="1" cellpadding="5">
            <tr><th>Ciudad</th><th>Producto Más Vendido</th><th>Cantidad Vendida</th></tr>
            ${ciudadTableRows}
        </table>
        `;

        // -------------------------------------------
        // 13) SERVICIOS CON MÁS DURACIÓN ACUMULADA
        // -------------------------------------------
        html += `
        <h2>13) Servicios con más duración total acumulada (minutos)</h2>
        <canvas id="chart_duracion" width="800" height="300"></canvas>
        <table border="1" cellpadding="5">
            <tr><th>ID</th><th>Servicio</th><th>Duración Total (minutos)</th></tr>
            ${serviciosDuracion.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join("")}
        </table>
        `;
        let labelsDuracion = serviciosDuracion.map(r => r[1]);
        let valoresDuracion = serviciosDuracion.map(r => r[2]);
        

        // -------------------------------------------
        // 14) MARGEN ESTIMADO POR TIPO
        // -------------------------------------------
        html += `
        <h2>14) Margen estimado por tipo</h2>
        <canvas id="pie_margen" width="400" height="300"></canvas>
        <table border="1" cellpadding="5">
            <tr><th>Tipo</th><th>Margen Estimado (€)</th></tr>
            <tr><td>Productos</td><td>${margenEstimado.productos.toFixed(2)} €</td></tr>
            <tr><td>Servicios</td><td>${margenEstimado.servicios.toFixed(2)} €</td></tr>
        </table>
        `;
        let labelsMargen = ["Productos", "Servicios"];
        let valoresMargen = [margenEstimado.productos, margenEstimado.servicios];
        
        
        // -------------------------------------------
        // 2. DIBUJAR HTML Y GRÁFICOS
        // -------------------------------------------
        resultsDiv.innerHTML = html;

        // GRÁFICOS
        drawHorizontalBarChart("chart_facturacion", labelsFact, valoresFact, "Facturación por producto");
        drawPieChart("pie_comparativa", labelsComp, valoresComp, "Facturación: Prod. vs Serv.");
        drawHorizontalBarChart("chart_duracion", labelsDuracion, valoresDuracion, "Duración total por servicio");
        drawPieChart("pie_margen", labelsMargen, valoresMargen, "Distribución del margen estimado");


    } catch (err) {
        resultsDiv.innerHTML = `<p style="color:red;">Error al cargar los informes de Roy. Asegúrate de que el backend de Python está corriendo y los métodos C_Roy_... son accesibles.</p><p style="color:red;">Detalle: ${err.message}</p>`;
        console.error("Error al cargar estadísticas de Roy:", err);
    }
}