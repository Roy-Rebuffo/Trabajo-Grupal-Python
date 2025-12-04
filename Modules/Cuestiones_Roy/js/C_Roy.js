// ========================================================
// REUTILIZACIÓN DE GRÁFICOS (Mantenidos del C_Fabian.js)
// ========================================================

function clearCanvas(ctx, canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// 📊 GRÁFICO DE BARRAS VERTICAL
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
        // Etiqueta del eje X
        ctx.save();
        ctx.translate(x + barWidth / 2, height - 10);
        ctx.rotate(-Math.PI / 4); // Rotar etiquetas si son largas
        ctx.textAlign = 'right';
        ctx.fillText(labels[i], 0, 0);
        ctx.restore();

        // Valor de la barra
        ctx.fillText(value.toFixed(2).replace(/\.00$/, ''), x, y - 5);
    });
}

// 📊 GRÁFICO DE BARRAS HORIZONTAL
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
        // Etiqueta del eje Y (izquierda)
        ctx.fillText(labels[i], 10, y + barHeight - 5);

        // Valor
        ctx.fillText(value.toFixed(2).replace(/\.00$/, ''), 160 + barWidth, y + barHeight - 5);
    });
}

// 🥧 GRÁFICO DE PASTEL
function drawPieChart(canvasId, labels, values, title="") {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    clearCanvas(ctx, canvas);

    const total = values.reduce((a,b) => a + b, 0);
    let startAngle = 0;

    ctx.font = "18px Arial";
    ctx.fillText(title, 10, 25);

    const colors = ["#4A90E2", "#E26A4A", "#50C878", "#9B59B6", "#F4D03F", "#5DADE2", "#FF9900"];

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
        const porcentaje = (value / total * 100).toFixed(1);
        ctx.fillText(`${labels[i]} (${porcentaje}%)`, labelX - 30, labelY);

        startAngle += sliceAngle;
    });
}


// ========================================================
// 🚀 FUNCIÓN PRINCIPAL DE CARGA DE ESTADÍSTICAS ROY (Grupo 2)
// ========================================================

async function loadStatsRoy() {
    const resultsDiv = document.getElementById("results_roy");
    resultsDiv.innerHTML = "<p>Cargando datos del Grupo 2 desde Python...</p>";

    try {
        // Llama a los métodos usando la clave 'C_Roy'
        const rankingFacturacion = await window.pywebview.api.C_Roy_ranking_productos_por_facturacion();
        const serviciosPorEmpleado = await window.pywebview.api.C_Roy_servicios_vendidos_por_empleado();
        const stockReposicion = await window.pywebview.api.C_Roy_stock_vendido_y_reposicion();
        const comparativaPS = await window.pywebview.api.C_Roy_comparativa_productos_vs_servicios();
        const productoPorCiudad = await window.pywebview.api.C_Roy_producto_mas_vendido_por_ciudad();
        const serviciosDuracion = await window.pywebview.api.C_Roy_servicios_por_duracion_acumulada();
        const margenEstimado = await window.pywebview.api.C_Roy_margen_estimado_por_tipo();

        let html = "";
        
        // -------------------------------------------
        // 8) RANKING DE PRODUCTOS POR FACTURACIÓN + TABLA
        // -------------------------------------------
        html += `
        <h2>8) Ranking de productos con mayor facturación (Base Imponible)</h2>
        <canvas id="chart_fact_prod" width="800" height="300"></canvas>
        <table border="1" cellpadding="5">
            <tr><th>ID</th><th>Producto</th><th>Facturación (€)</th></tr>
            ${rankingFacturacion.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2].toFixed(2)}</td></tr>`).join("")}
        </table>
        `;
        let labelsFactProd = rankingFacturacion.map(r => r[1]);
        let valoresFactProd = rankingFacturacion.map(r => r[2]);
        
        // -------------------------------------------
        // 9) SERVICIOS MÁS VENDIDOS POR EMPLEADO + TABLA
        // -------------------------------------------
        html += `
        <h2>9) Servicios más vendidos por empleado</h2>
        <table border="1" cellpadding="5" class="table-full-width">
            <tr><th>Empleado</th><th>Servicios vendidos (Nombre, Cantidad)</th></tr>
            ${Object.keys(serviciosPorEmpleado).map(empleado => `
                <tr>
                    <td><strong>${empleado}</strong></td>
                    <td>
                        ${serviciosPorEmpleado[empleado].map(s => `${s[0]} (${s[1]} uds)`).join(", ")}
                    </td>
                </tr>
            `).join("")}
        </table>
        `;

        // -------------------------------------------
        // 10) STOCK VENDIDO Y REPOSICIÓN + TABLA
        // -------------------------------------------
        html += `
        <h2>10) Relación entre stock vendido y reposición necesaria</h2>
        <table border="1" cellpadding="5">
            <tr><th>Producto</th><th>Stock Actual</th><th>Cant. Vendida</th><th>Reposición Sugerida</th></tr>
            ${Object.values(stockReposicion).map(p => `
                <tr class="${p.reposicion_sugerida > 0 ? 'highlight-red' : ''}">
                    <td>${p.nombre}</td>
                    <td>${p.stock_actual}</td>
                    <td>${p.cantidad_vendida}</td>
                    <td>${p.reposicion_sugerida}</td>
                </tr>
            `).join("")}
        </table>
        `;
        
        // -------------------------------------------
        // 11) COMPARATIVA PRODUCTOS VS SERVICIOS
        // -------------------------------------------
        let labelsComp = Object.keys(comparativaPS);
        let valoresComp = Object.values(comparativaPS);

        html += `
        <h2>11) Comparativa Facturación: Productos vs Servicios</h2>
        <canvas id="pie_comp_ps" width="400" height="300"></canvas>
        <p>Productos: ${comparativaPS.productos.toFixed(2)} € | Servicios: ${comparativaPS.servicios.toFixed(2)} €</p>
        `;
        
        // -------------------------------------------
        // 12) PRODUCTO MÁS VENDIDO POR CIUDAD + TABLA
        // -------------------------------------------
        html += `
        <h2>12) Producto más vendido según ciudad del cliente</h2>
        <table border="1" cellpadding="5">
            <tr><th>Ciudad</th><th>Producto Más Vendido</th><th>Cantidad</th></tr>
            ${Object.keys(productoPorCiudad).map(ciudad => {
                const data = productoPorCiudad[ciudad];
                return `<tr>
                    <td><strong>${ciudad}</strong></td>
                    <td>${data ? data.nombre_producto : 'N/A'}</td>
                    <td>${data ? data.cantidad : '0'}</td>
                </tr>`;
            }).join("")}
        </table>
        `;
        
        // -------------------------------------------
        // 13) SERVICIOS CON MÁS DURACIÓN ACUMULADA + TABLA
        // -------------------------------------------
        html += `
        <h2>13) Servicios con más duración total acumulada (Minutos)</h2>
        <canvas id="chart_serv_duracion" width="800" height="300"></canvas>
        <table border="1" cellpadding="5">
            <tr><th>ID</th><th>Servicio</th><th>Duración Total (min)</th></tr>
            ${serviciosDuracion.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join("")}
        </table>
        `;
        let labelsDuracion = serviciosDuracion.map(r => r[1]);
        let valoresDuracion = serviciosDuracion.map(r => r[2]);
        
        // -------------------------------------------
        // 14) MARGEN ESTIMADO POR TIPO
        // -------------------------------------------
        let labelsMargen = Object.keys(margenEstimado);
        let valoresMargen = Object.values(margenEstimado);

        html += `
        <h2>14) Margen Estimado por Tipo (Costo 50% Asumido)</h2>
        <canvas id="pie_margen" width="400" height="300"></canvas>
        <p>Margen Productos: ${margenEstimado.productos.toFixed(2)} € | Margen Servicios: ${margenEstimado.servicios.toFixed(2)} €</p>
        `;


        resultsDiv.innerHTML = html;

        // ---------------------
        // DIBUJAR GRÁFICOS
        // ---------------------
        drawBarChart("chart_fact_prod", labelsFactProd, valoresFactProd, "Facturación por Producto");
        drawPieChart("pie_comp_ps", labelsComp, valoresComp, "Facturación Productos vs Servicios");
        drawBarChart("chart_serv_duracion", labelsDuracion, valoresDuracion, "Duración Total de Servicios (min)");
        drawPieChart("pie_margen", labelsMargen, valoresMargen, "Margen Productos vs Servicios");

    } catch (err) {
        resultsDiv.innerHTML = `<p style="color:red;">Error al cargar los informes de Roy. Asegúrate de que el backend está corriendo y el API de Python expone el módulo 'C_Roy'.</p><p style="color:red;">Error: ${err.message}</p>`;
        console.error("Error al cargar estadísticas de Roy:", err);
    }
}