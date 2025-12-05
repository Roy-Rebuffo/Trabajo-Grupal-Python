// ---------------------------
// UTILIDADES CANVAS
// ---------------------------
function clearCanvas(ctx, canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

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
        ctx.fillText(value.toFixed(2), x, y - 5);
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
        ctx.fillText(value.toFixed(2), 160 + barWidth, y + barHeight - 5);
    });
}

function drawPieChart(canvasId, labels, values, title="") {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext("2d");
    clearCanvas(ctx, canvas);
    const total = values.reduce((a,b) => a + b, 0);
    let startAngle = 0;
    ctx.font = "18px Arial";
    ctx.fillText(title, 10, 25);
    const colors = ["#4A90E2", "#E26A4A", "#50C878", "#9B59B6", "#F4D03F", "#5DADE2"];
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
        ctx.fillText(`${labels[i]} (${value.toFixed(2)})`, labelX - 20, labelY);
        startAngle += sliceAngle;
    });
}

// ---------------------------
// CARGAR DATOS DESDE PYWEBVIEW
// ---------------------------
async function loadStats() {
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "<p>Cargando datos...</p>";

    try {
        const ingresosCat = await pywebview.api.C_Mar_ingresos_por_categoria();
        const variacionCiudad = await pywebview.api.C_Mar_variacion_mensual_por_ciudad();
        const impactoIVA = await pywebview.api.C_Mar_impacto_iva();
        const gastoEmpleado = await pywebview.api.C_Mar_gasto_por_empleado();
        const retornoClientes = await pywebview.api.C_Mar_retorno_clientes();
        const clvClientes = await pywebview.api.C_Mar_clv_por_cliente();
        const tasaCrecimiento = await pywebview.api.C_Mar_tasa_crecimiento();

        let html = "";

        // 1) INGRESOS POR CATEGORIA
        html += `<h2>1) Ingresos por categoría</h2>
        <canvas id="chart_ingresos" width="800" height="300"></canvas>
        <table border="1" cellpadding="5">
            <tr><th>Categoría</th><th>Total</th></tr>
            ${Object.keys(ingresosCat).map(k => `<tr><td>${k}</td><td>${ingresosCat[k].toFixed(2)}</td></tr>`).join("")}
        </table>
        <canvas id="pie_ingresos" width="400" height="300"></canvas>`;

        // 2) VARIACION MENSUAL POR CIUDAD
        const ciudades = Object.keys(variacionCiudad);
        const valoresCiudad = ciudades.map(c => Object.values(variacionCiudad[c] || {}).reduce((a,b)=>a+b,0));
        html += `<h2>2) Variación mensual por ciudad</h2>
        <canvas id="chart_variacion" width="800" height="300"></canvas>
        <table border="1" cellpadding="5">
            <tr><th>Ciudad</th><th>Total</th></tr>
            ${ciudades.map((c,i) => `<tr><td>${c}</td><td>${valoresCiudad[i].toFixed(2)}</td></tr>`).join("")}
        </table>
        <canvas id="pie_variacion" width="400" height="300"></canvas>`;

        // 3) IMPACTO IVA
        const labelsIVA = Object.keys(impactoIVA);
        const valoresIVA = Object.values(impactoIVA);
        html += `<h2>3) Impacto del IVA</h2>
        <canvas id="chart_iva" width="800" height="300"></canvas>
        <table border="1" cellpadding="5">
            <tr><th>Tipo</th><th>IVA</th></tr>
            ${labelsIVA.map((l,i)=>`<tr><td>${l}</td><td>${valoresIVA[i].toFixed(2)}</td></tr>`).join("")}
        </table>
        <canvas id="pie_iva" width="400" height="300"></canvas>`;

        // 4) GASTO POR EMPLEADO
        const labelsEmpleado = Object.keys(gastoEmpleado);
        const valoresEmpleado = Object.values(gastoEmpleado);
        html += `<h2>4) Gasto por empleado</h2>
        <canvas id="chart_gasto" width="800" height="300"></canvas>
        <table border="1" cellpadding="5">
            <tr><th>Empleado</th><th>Total</th></tr>
            ${labelsEmpleado.map((l,i)=>`<tr><td>${l}</td><td>${valoresEmpleado[i].toFixed(2)}</td></tr>`).join("")}
        </table>
        <canvas id="pie_gasto" width="400" height="300"></canvas>`;

        // 5) RETORNO CLIENTES
        const labelsRetorno = Object.keys(retornoClientes);
        const valoresRetorno = Object.values(retornoClientes);
        html += `<h2>5) Productos/Servicios con mayor retorno</h2>
        <canvas id="chart_retorno" width="800" height="300"></canvas>
        <table border="1" cellpadding="5">
            <tr><th>ID</th><th>Repeticiones</th></tr>
            ${labelsRetorno.map((l,i)=>`<tr><td>${l}</td><td>${valoresRetorno[i]}</td></tr>`).join("")}
        </table>
        <canvas id="pie_retorno" width="400" height="300"></canvas>`;

        // 6) CLV POR CLIENTE
        const labelsCLV = Object.keys(clvClientes);
        const valoresCLV = Object.values(clvClientes);
        html += `<h2>6) CLV por cliente</h2>
        <canvas id="chart_clv" width="800" height="300"></canvas>
        <table border="1" cellpadding="5">
            <tr><th>Cliente</th><th>CLV</th></tr>
            ${labelsCLV.map(l=>`<tr><td>${clvClientes[l].nombre}</td><td>${clvClientes[l].clv.toFixed(2)}</td></tr>`).join("")}
        </table>
        <canvas id="pie_clv" width="400" height="300"></canvas>`;

        resultsDiv.innerHTML = html;

        // ---------------------------
        // DIBUJAR GRÁFICOS
        // ---------------------------
        drawBarChart("chart_ingresos", Object.keys(ingresosCat), Object.values(ingresosCat), "Ingresos por categoría");
        drawPieChart("pie_ingresos", Object.keys(ingresosCat), Object.values(ingresosCat), "Distribución ingresos");

        drawHorizontalBarChart("chart_variacion", ciudades, valoresCiudad, "Total facturado por ciudad");
        drawPieChart("pie_variacion", ciudades, valoresCiudad, "Distribución por ciudad");

        drawBarChart("chart_iva", labelsIVA, valoresIVA, "Impacto IVA");
        drawPieChart("pie_iva", labelsIVA, valoresIVA, "Distribución IVA");

        drawBarChart("chart_gasto", labelsEmpleado, valoresEmpleado, "Gasto por empleado");
        drawPieChart("pie_gasto", labelsEmpleado, valoresEmpleado, "Distribución gasto empleado");

        drawBarChart("chart_retorno", labelsRetorno, valoresRetorno, "Retorno clientes");
        drawPieChart("pie_retorno", labelsRetorno, valoresRetorno, "Distribución retorno");

        drawBarChart("chart_clv", labelsCLV, valoresCLV.map(v=>v.clv), "CLV por cliente");
        drawPieChart("pie_clv", labelsCLV, valoresCLV.map(v=>v.clv), "Distribución CLV");

    } catch (err) {
        resultsDiv.innerHTML = `<p style="color:red;">Error: ${err}</p>`;
    }
}


