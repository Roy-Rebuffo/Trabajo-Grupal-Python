

// --------------------------------------------------------
// UTILIDADES DE CANVAS
// --------------------------------------------------------

function clearCanvas(ctx, canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// ---------------------------
// 📊 GRÁFICO DE BARRAS VERTICAL
// ---------------------------
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

// ---------------------------
// 📊 GRÁFICO DE BARRAS HORIZONTAL
// ---------------------------
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

// ---------------------------
// 🥧 GRÁFICO DE PASTEL
// ---------------------------
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
        ctx.fillText(`${labels[i]} (${value})`, labelX - 20, labelY);

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
        const topGasto = await window.pywebview.api.C_Fabian_top_clientes_por_gasto();
        const ticketProm = await window.pywebview.api.C_Fabian_ticket_promedio_por_cliente();
        const franjaEdad = await window.pywebview.api.C_Fabian_compras_por_franja_edad();
        const topServicios = await window.pywebview.api.C_Fabian_top_clientes_por_servicios();

        let html = "";

        //-------------------------------------------
        // 1) TOP CLIENTES POR GASTO + TABLA
        //-------------------------------------------
        html += `
        <h2>1) Top clientes por gasto</h2>
        <canvas id="chart_top_gasto" width="800" height="300"></canvas>
        <table border="1" cellpadding="5">
            <tr><th>ID</th><th>Cliente</th><th>Total</th></tr>
            ${topGasto.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join("")}
        </table>
        <canvas id="pie_top_gasto" width="400" height="300"></canvas>
        `;

        let labelsGasto = topGasto.map(r => r[1]);
        let valoresGasto = topGasto.map(r => r[2]);

        //-------------------------------------------
        // 2) TICKET PROMEDIO + TABLA
        //-------------------------------------------
        html += `
        <h2>2) Ticket promedio por cliente</h2>
        <canvas id="chart_ticket" width="800" height="300"></canvas>
        <table border="1" cellpadding="5">
            <tr><th>Cliente</th><th>Promedio</th></tr>
            ${Object.keys(ticketProm).map(cid =>
                `<tr><td>${ticketProm[cid][0]}</td><td>${ticketProm[cid][1].toFixed(2)}</td></tr>`
            ).join("")}
        </table>
        <canvas id="pie_ticket" width="400" height="300"></canvas>
        `;

        let labelsTicket = Object.values(ticketProm).map(v => v[0]);
        let valoresTicket = Object.values(ticketProm).map(v => v[1]);

        //-------------------------------------------
        // 6) FRANJAS DE EDAD + TABLA
        //-------------------------------------------
        html += `
        <h2>6) Compras por franja de edad</h2>
        <canvas id="chart_franjas" width="800" height="300"></canvas>
        <table border="1" cellpadding="5">
            <tr><th>Franja</th><th>Cantidad</th></tr>
            ${Object.keys(franjaEdad).map(f =>
                `<tr><td>${f}</td><td>${franjaEdad[f].length}</td></tr>`
            ).join("")}
        </table>
        <canvas id="pie_franjas" width="400" height="300"></canvas>
        `;

        let labelsFranjas = Object.keys(franjaEdad);
        let valoresFranjas = Object.values(franjaEdad).map(arr => arr.length);

        //-------------------------------------------
        // 7) TOP SERVICIOS + TABLA
        //-------------------------------------------
        html += `
        <h2>7) Top clientes por servicios solicitados</h2>
        <canvas id="chart_servicios" width="800" height="300"></canvas>
        <table border="1" cellpadding="5">
            <tr><th>ID</th><th>Cliente</th><th>Cantidad</th></tr>
            ${topServicios.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join("")}
        </table>
        <canvas id="pie_servicios" width="400" height="300"></canvas>
        `;

        let labelsServicios = topServicios.map(r => r[1]);
        let valoresServicios = topServicios.map(r => r[2]);

        resultsDiv.innerHTML = html;

        // ---------------------
        // DIBUJAR GRÁFICOS
        // ---------------------
        drawBarChart("chart_top_gasto", labelsGasto, valoresGasto, "Gasto total");
        drawPieChart("pie_top_gasto", labelsGasto, valoresGasto, "Distribución del gasto");

        drawBarChart("chart_ticket", labelsTicket, valoresTicket, "Ticket promedio");
        drawPieChart("pie_ticket", labelsTicket, valoresTicket, "Distribución del ticket");

        drawHorizontalBarChart("chart_franjas", labelsFranjas, valoresFranjas, "Compras por edad");
        drawPieChart("pie_franjas", labelsFranjas, valoresFranjas, "Edad");

        drawBarChart("chart_servicios", labelsServicios, valoresServicios, "Servicios solicitados");
        drawPieChart("pie_servicios", labelsServicios, valoresServicios, "Distribución servicios");

    } catch (err) {
        resultsDiv.innerHTML = `<p style="color:red;">Error: ${err}</p>`;
    }
}
