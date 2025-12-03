let productosIndex = new Map();

//Mantener: cargar productos en el select al estar lista la API
window.addEventListener("pywebviewready", async () => {
  try {
    const productos = await pywebview.api.Facturas_get_productos();
    console.log("Productos recibidos:", productos);

    const select = document.getElementById("productoSelect");
    select.innerHTML = "";

    productos.forEach(p => {
      const option = document.createElement("option");
      option.value = p.id;
      option.textContent = `${p.name} - ${p.price} EUR`;
      select.appendChild(option);
      productosIndex.set(p.id, p); // índice para lookup rápido por id
    });

    const clientes = await pywebview.api.Facturas_get_clientes();
    const selectCli = document.getElementById("clienteSelect");
    selectCli.innerHTML = "";
    clientes.forEach(c => {
      const option = document.createElement("option");
      option.value = c.id;
      option.textContent = `${c.name} ${c.surname}`;
      selectCli.appendChild(option);
    });

  } catch (err) {
    console.error("Error al cargar productos:", err);
  }
});

//Añadir líneas a la tabla usando el producto seleccionado y la cantidad del input
document.getElementById("addLinea").addEventListener("click", () => {
  const producto_id = document.getElementById("productoSelect").value;
  const cantidadInput = document.getElementById("cantidad");
  const cantidad = parseInt(cantidadInput.value || "1", 10);

  if (!producto_id) return;
  if (!Number.isFinite(cantidad) || cantidad <= 0) {
    alert("Cantidad inválida"); 
    return;
  }

  const p = productosIndex.get(producto_id);
  if (!p) {
    alert("Producto no encontrado");
    return;
  }

  const tbody = document.getElementById("productosBody");
  const tr = document.createElement("tr");
  tr.dataset.productoId = producto_id;
  tr.dataset.cantidad = String(cantidad);

  //columnas: producto, cantidad, precio, importe, acción
  const tdProducto = document.createElement("td");
  tdProducto.textContent = p.name;

  const tdCantidad = document.createElement("td");
  tdCantidad.textContent = cantidad;

  const tdPrecio = document.createElement("td");
  tdPrecio.textContent = `${Number(p.price).toFixed(2)} EUR`;

  const tdImporte = document.createElement("td");
  const importe = Number(p.price) * cantidad;
  tdImporte.textContent = `${importe.toFixed(2)} EUR`;

  const tdAccion = document.createElement("td");
  const btnEliminar = document.createElement("button");
  btnEliminar.type = "button";
  btnEliminar.textContent = "Eliminar";
  btnEliminar.onclick = () => tr.remove();
  tdAccion.appendChild(btnEliminar);

  tr.appendChild(tdProducto);
  tr.appendChild(tdCantidad);
  tr.appendChild(tdPrecio);
  tr.appendChild(tdImporte);
  tr.appendChild(tdAccion);
  tbody.appendChild(tr);

  cantidadInput.value = "1";
});

//Enviar la factura con todas las líneas agregadas en la tabla
document.getElementById("facturaForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const numero = document.getElementById("numero").value;
  const cliente_id = document.getElementById("clienteSelect").value;

  const lineas = [];
  document.querySelectorAll("#productosBody tr").forEach(tr => {
    const producto_id = tr.dataset.productoId;
    const cantidad = parseInt(tr.dataset.cantidad, 10);
    lineas.push({ producto_id, cantidad });
  });

  if (lineas.length === 0) {
    alert("Añade al menos un producto antes de generar la factura.");
    return;
  }

  try {
    const result = await pywebview.api.Facturas_get_clientes(
      numero,
      cliente_id,
      lineas,
      21,
      0
    );
    const out = document.getElementById("resultado");
  } catch (err) {
    console.error("Error al generar factura:", err);
    alert("Error al generar la factura. Revisa los datos.");
  }
});