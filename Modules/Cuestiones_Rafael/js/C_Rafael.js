// --------------------------------------------------------
// UTILIDADES DE CANVAS
// --------------------------------------------------------
function clearCanvas(ctx, canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Gráficos vertical, horizontal y pastel (igual que Fabian)
function drawBarChart(canvasId, labels, values, title="") {
    const canvas = document.getElementById(canvasId);
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
        ctx.fillText(value, x, y - 5);
    });
}

function drawHorizontalBarChart(canvasId, labels, values, title="") {
    const canvas = document.getElementById(canvasId);
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
        ctx.fillText(value, 160 + barWidth, y + barHeight - 5);
    });
}

function drawPieChart(canvasId, labels, values, title="") {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext("2d");
    clearCanvas(ctx, canvas);
    const total = values.reduce((a,b)=>a+b,0);
    let startAngle = 0;
    ctx.font = "18px Arial";
    ctx.fillText(title, 10, 25);
    const colors = ["#4A90E2","#E26A4A","#50C878","#9B59B6","#F4D03F","#5DADE2"];
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
        ctx.fillText(`${labels[i]} (${value})`, labelX-20, labelY);
        startAngle += sliceAngle;
    });
}

// --------------------------------------------------------
// 🚀 FUNCIÓN PRINCIPAL
// --------------------------------------------------------
async function loadStats() {
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "<p>Cargando datos...</p>";
    try {
        const facturacion = await window.pywebview.api.C_Rafael_facturacion_por_empleado();
        const tiempoServicios = await window.pywebview.api.C_Rafael_tiempo_total_servicios();
        const promedioVenta = await window.pywebview.api.C_Rafael_promedio_venta_por_turno();
        const clientesEmpleado = await window.pywebview.api.C_Rafael_clientes_por_empleado();
        const comparativa = await window.pywebview.api.C_Rafael_comparativa_nuevos_antiguos();
        const indice = await window.pywebview.api.C_Rafael_indice_conversion();
        const descuentos = await window.pywebview.api.C_Rafael_descuentos_por_empleado();

        let html = "";

        // 1) Facturación por empleado
        html += `<h2>1) Facturación por empleado</h2>
                 <canvas id="chart_facturacion" width="800" height="300"></canvas>
                 <table border="1" cellpadding="5">
                 <tr><th>ID</th><th>Empleado</th><th>Total</th></tr>
                 ${facturacion.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2].toFixed(2)}</td></tr>`).join("")}
                 </table>
                 <canvas id="pie_facturacion" width="400" height="300"></canvas>`;
        let labelsFacturacion = facturacion.map(r=>r[1]);
        let valoresFacturacion = facturacion.map(r=>r[2]);

        // 2) Tiempo total servicios
        html += `<h2>2) Tiempo total de servicios</h2>
                 <canvas id="chart_tiempo" width="800" height="300"></canvas>
                 <table border="1" cellpadding="5">
                 <tr><th>ID</th><th>Empleado</th><th>Tiempo total (min)</th></tr>
                 ${tiempoServicios.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join("")}
                 </table>`;
        let labelsTiempo = tiempoServicios.map(r=>r[1]);
        let valoresTiempo = tiempoServicios.map(r=>r[2]);

        // 3) Promedio de venta
        html += `<h2>3) Promedio de venta por turno/día</h2>
                 <canvas id="chart_promedio" width="800" height="300"></canvas>
                 <table border="1" cellpadding="5">
                 <tr><th>ID</th><th>Empleado</th><th>Promedio</th></tr>
                 ${promedioVenta.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2].toFixed(2)}</td></tr>`).join("")}
                 </table>`;
        let labelsPromedio = promedioVenta.map(r=>r[1]);
        let valoresPromedio = promedioVenta.map(r=>r[2]);

        // 4) Clientes por empleado
        html += `<h2>4) Clientes atendidos por empleado</h2>
                 <canvas id="chart_clientes" width="800" height="300"></canvas>
                 <table border="1" cellpadding="5">
                 <tr><th>ID</th><th>Empleado</th><th>Cantidad de clientes</th></tr>
                 ${clientesEmpleado.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join("")}
                 </table>`;
        let labelsClientes = clientesEmpleado.map(r=>r[1]);
        let valoresClientes = clientesEmpleado.map(r=>r[2]);

        // 5) Comparativa nuevos/antiguos
        html += `<h2>5) Comparativa empleados nuevos vs antiguos</h2>
                 <canvas id="chart_comparativa" width="800" height="300"></canvas>
                 <table border="1" cellpadding="5">
                 ${comparativa.map(r => `<tr><td>${r[0]}</td><td>${r[1].toFixed(2)}</td></tr>`).join("")}
                 </table>`;
        let labelsComparativa = comparativa.map(r=>r[0]);
        let valoresComparativa = comparativa.map(r=>r[1]);

        // 6) Índice de conversión
        html += `<h2>6) Índice de conversión</h2>
                 <canvas id="chart_indice" width="800" height="300"></canvas>
                 <table border="1" cellpadding="5">
                 <tr><th>ID</th><th>Empleado</th><th>Índice</th></tr>
                 ${indice.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join("")}
                 </table>`;
        let labelsIndice = indice.map(r=>r[1]);
        let valoresIndice = indice.map(r=>r[2]);

        // 7) Descuentos
        html += `<h2>7) Descuentos aplicados por empleado</h2>
                 <canvas id="chart_descuentos" width="800" height="300"></canvas>
                 <table border="1" cellpadding="5">
                 <tr><th>ID</th><th>Empleado</th><th>Total descuento</th></tr>
                 ${descuentos.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2].toFixed(2)}</td></tr>`).join("")}
                 </table>`;
        let labelsDescuentos = descuentos.map(r=>r[1]);
        let valoresDescuentos = descuentos.map(r=>r[2]);

        resultsDiv.innerHTML = html;

        // ------------------------
        // DIBUJAR GRÁFICOS
        // ------------------------
        drawBarChart("chart_facturacion", labelsFacturacion, valoresFacturacion, "Facturación por empleado");
        drawPieChart("pie_facturacion", labelsFacturacion, valoresFacturacion, "Distribución facturación");

        drawBarChart("chart_tiempo", labelsTiempo, valoresTiempo, "Tiempo total servicios");
        drawBarChart("chart_promedio", labelsPromedio, valoresPromedio, "Promedio de venta");
        drawBarChart("chart_clientes", labelsClientes, valoresClientes, "Clientes atendidos");
        drawPieChart("chart_comparativa", labelsComparativa, valoresComparativa, "Nuevos vs Antiguos");
        drawBarChart("chart_indice", labelsIndice, valoresIndice, "Índice de conversión");
        drawBarChart("chart_descuentos", labelsDescuentos, valoresDescuentos, "Descuentos aplicados");

    } catch(err) {
        resultsDiv.innerHTML = `<p style="color:red;">Error: ${err}</p>`;
    }
}
