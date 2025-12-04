let productosIndex = new Map();
let serviciosIndex = new Map();

// Cargar datos al estar lista la API
window.addEventListener("pywebviewready", async () => {
  try {
    // Productos
    const productos = await pywebview.api.Facturas_get_productos();
    const selectProd = document.getElementById("productoSelect");
    selectProd.innerHTML = "";
    productos.forEach(p => {
      const option = document.createElement("option");
      option.value = p.id;
      option.textContent = `${p.name} - ${p.price} EUR`;
      selectProd.appendChild(option);
      productosIndex.set(p.id, p);
    });

    // Servicios
    const servicios = await pywebview.api.services_getServices();
    const selectServ = document.getElementById("servicioSelect");
    selectServ.innerHTML = "";
    Object.entries(servicios).forEach(([id, s]) => {
      const option = document.createElement("option");
      option.value = id;
      option.textContent = `${s.name} - ${s.price} EUR`;
      selectServ.appendChild(option);
      serviciosIndex.set(id, s);
    });

    // Clientes
    const clientesRaw = await pywebview.api.customers_GetCustomers();
    const clientes = Array.isArray(clientesRaw)
      ? clientesRaw
      : Object.entries(clientesRaw).map(([id, c]) => ({
          id,
          name: c.name ?? "",
          surname: c.surname ?? "",
          email: c.email ?? "",
          phone: c.phone ?? "",
          city: c.city ?? ""
        }));

    const selectCli = document.getElementById("clienteSelect");
    selectCli.innerHTML = "";
    clientes.forEach(c => {
      const option = document.createElement("option");
      option.value = c.id;
      option.textContent = `${c.name} ${c.surname}`;
      selectCli.appendChild(option);
    });

    // Usuarios (empleados)
    const usuariosRaw = await pywebview.api.users_cargar_usuarios();
const usuarios = Array.isArray(usuariosRaw)
  ? usuariosRaw
  : Object.entries(usuariosRaw).map(([id, u]) => ({
      id_usuario: id,
      name: u.name ?? "",
      surname: u.surname ?? ""
    }));

const selectUsu = document.getElementById("usuarioSelect");
selectUsu.innerHTML = "";
usuarios.forEach(u => {
  const option = document.createElement("option");
  option.value = u.id_usuario;
  option.textContent = `${u.name} ${u.surname}`;
  selectUsu.appendChild(option);
});



  } catch (err) {
    console.error("Error al cargar datos:", err);
  }
});

// Añadir producto
document.getElementById("addProducto").addEventListener("click", () => {
  const producto_id = document.getElementById("productoSelect").value;
  const cantidad = parseInt(document.getElementById("cantidadProducto").value || "1", 10);
  if (!producto_id || cantidad <= 0) return;

  const p = productosIndex.get(producto_id);
  const importe = Number(p.price) * cantidad;

  addLinea(producto_id, "producto", cantidad, p.price, importe);
  document.getElementById("cantidadProducto").value = "1";
});

// Añadir servicio
document.getElementById("addServicio").addEventListener("click", () => {
  const servicio_id = document.getElementById("servicioSelect").value;
  const cantidad = parseInt(document.getElementById("cantidadServicio").value || "1", 10);
  if (!servicio_id || cantidad <= 0) return;

  const s = serviciosIndex.get(servicio_id);
  const importe = Number(s.price) * cantidad;

  addLinea(servicio_id, "servicio", cantidad, s.price, importe);
  document.getElementById("cantidadServicio").value = "1";
});

// Añadir fila a la tabla
function addLinea(id_referencia, tipo, cantidad, precio_unitario, importe) {
  const tbody = document.getElementById("itemsBody");
  const tr = document.createElement("tr");
  tr.dataset.idReferencia = id_referencia;
  tr.dataset.tipo = tipo;
  tr.dataset.cantidad = String(cantidad);
  tr.dataset.precio = String(precio_unitario);

  const tdRef = document.createElement("td");
  tdRef.textContent = id_referencia;

  const tdTipo = document.createElement("td");
  tdTipo.textContent = tipo;

  const tdCantidad = document.createElement("td");
  tdCantidad.textContent = cantidad;

  const tdPrecio = document.createElement("td");
  tdPrecio.textContent = `${Number(precio_unitario).toFixed(2)} EUR`;

  const tdImporte = document.createElement("td");
  tdImporte.textContent = `${importe.toFixed(2)} EUR`;

  const tdAccion = document.createElement("td");
  const btnEliminar = document.createElement("button");
  btnEliminar.type = "button";
  btnEliminar.textContent = "Eliminar";
  btnEliminar.onclick = () => tr.remove();
  tdAccion.appendChild(btnEliminar);

  tr.appendChild(tdRef);
  tr.appendChild(tdTipo);
  tr.appendChild(tdCantidad);
  tr.appendChild(tdPrecio);
  tr.appendChild(tdImporte);
  tr.appendChild(tdAccion);
  tbody.appendChild(tr);
}

// Enviar factura
document.getElementById("facturaForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const numero = document.getElementById("numero").value;
  const cliente_id = document.getElementById("clienteSelect").value;
  const empleado_id = document.getElementById("usuarioSelect").value;

  const lineas = [];
  document.querySelectorAll("#itemsBody tr").forEach(tr => {
    const id_referencia = tr.dataset.idReferencia;
    const tipo = tr.dataset.tipo;
    const cantidad = parseInt(tr.dataset.cantidad, 10);
    const precio_unitario = parseFloat(tr.dataset.precio);
    const total_linea = precio_unitario * cantidad;

    lineas.push({ id_referencia, tipo, cantidad, precio_unitario, total_linea });
  });

  if (lineas.length === 0) {
    alert("Añade al menos un producto o servicio antes de generar la factura.");
    return;
  }

  try {
    const result = await pywebview.api.Facturas_crear_factura(
      numero,
      cliente_id,
      empleado_id,
      lineas,
      21,
      0
    );

    console.log("Factura generada:", result);
    document.getElementById("resultado").innerText =
      "Factura generada:\n" + JSON.stringify(result.factura, null, 2) +
      "\nPDF en: " + result.pdf;

  } catch (err) {
    console.error("Error al generar factura:", err);
    document.getElementById("resultado").innerText =
      "Error al generar factura. Revisa los datos.";
  }
});