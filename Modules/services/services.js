// ==========================
//  VARIABLES Y ARRAYS
// ==========================
let servicesList = [];   // Se cargará desde Python
let filteredList = [];   // Lista tras filtros/orden

// ==========================
//  UTILIDADES
// ==========================
/**
 * Normaliza una cadena eliminando acentos (diacríticos) y la convierte a minúsculas.
 * Ej: "Peluquería" -> "peluqueria"
 * @param {string} str 
 * @returns {string}
 */
function normalizeString(str) {
    if (!str) return "";
    // Elimina diacríticos (acentos) y convierte a minúsculas
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}


// ==========================
//  CARGAR DATOS AL INICIO
// ==========================
window.addEventListener('pywebviewready', () => {
    console.log("PyWebView listo.");
    loadServices();
    loadStats(); // Cargar estadísticas al iniciar
});

function loadServices() {
    pywebview.api.services_getServices()
        .then(data => {

            // data es un diccionario → transformarlo en array
            servicesList = Object.entries(data).map(([id, obj]) => ({
                id: id,
                ...obj
            }));

            filteredList = [...servicesList];

            renderServicesTable(filteredList);
        })
        .catch(err => console.error("Error al cargar servicios:", err));
}

// ==========================
//  CARGAR Y PINTAR ESTADÍSTICAS
// ==========================
function loadStats() {
    pywebview.api.services_getServicesStats()
        .then(stats => {
            renderStats(stats);
        })
        .catch(err => console.error("Error al cargar estadísticas:", err));
}

function renderStats(stats) {
    document.getElementById("stats_total_services").textContent = stats.total_services;
    document.getElementById("stats_active_services").textContent = stats.active_services;
    document.getElementById("stats_avg_price").textContent = `${stats.avg_price} €`;
    document.getElementById("stats_avg_duration").textContent = `${stats.avg_duration} min`;
    
    // Renderizar conteo de categorías
    const catList = document.getElementById("stats_categories");
    catList.innerHTML = "";
    
    // Ordenar categorías por cantidad (descendente)
    const sortedCategories = Object.entries(stats.categories).sort(([, countA], [, countB]) => countB - countA);

    sortedCategories.forEach(([name, count]) => {
        const li = document.createElement("li");
        li.textContent = `${name}: ${count}`;
        catList.appendChild(li);
    });
}

// ==========================
//  PINTAR TABLA
// ==========================
function renderServicesTable(list) {
    const tbody = document.querySelector("#services_table tbody");
    tbody.innerHTML = "";

    list.forEach(service => {
        const row = document.createElement("tr");

        row.innerHTML = `
    <td>${service.name}</td>
    <td>${service.category}</td>
    <td>${service.price} €</td>
    <td>${service.duration_minutes} min</td>
    <td>${service.active ? "✔️" : "❌"}</td>
    <td>
        <button class="delete-btn" onclick="deleteService('${service.id}')">Delete</button>
    </td>
`;

        tbody.appendChild(row);
    });
}

// ==========================
//  RECOGER DATOS DEL FORM
// ==========================
function collectServiceData() {
    return {
        name: document.getElementById('s_name').value,
        category: document.getElementById('s_category').value,
        price: parseFloat(document.getElementById('s_price').value),
        duration_minutes: parseInt(document.getElementById('s_duration').value),
        active: document.getElementById('s_active').checked
    };
}

// ==========================
//  AÑADIR SERVICIO
// ==========================
function SendServiceData() {
    const data = collectServiceData();

    console.log("Enviando:", data);

    pywebview.api.services_addService(data)
        .then(() => {
            console.log("Servicio añadido correctamente");
            loadServices(); // recargar tabla
            loadStats();    // recargar estadísticas
        })
        .catch(err => console.error("ERROR:", err));
}

// ==========================
//  BORRAR SERVICIO
// ==========================
function deleteService(id) {
    if (!confirm("¿Seguro que deseas borrar este servicio?")) return;

    pywebview.api.services_deleteService(id)
        .then(() => {
            console.log("Servicio borrado");
            loadServices();
            loadStats();    // recargar estadísticas
        })
        .catch(err => console.error("Error al borrar servicio:", err));
}

// ==========================
//  FILTROS Y ORDENACIÓN
// ==========================
function filterServices() {
    const filterValue = document.getElementById("filter_category").value.trim();
    // 💡 Usamos normalizeString para manejar acentos
    const normalizedFilter = normalizeString(filterValue); 
    const sortType = document.getElementById("filter_sort").value;

    // FILTRO: Se aplica la normalización
    filteredList = servicesList.filter(s =>
        normalizeString(s.category).includes(normalizedFilter)
    );

    // ORDEN -->
    if (sortType === "name") {
        filteredList.sort((a, b) => a.name.localeCompare(b.name));
    }
    else if (sortType === "duration") {
        filteredList.sort((a, b) => a.duration_minutes - b.duration_minutes);
    }
    else if (sortType === "price") {
        filteredList.sort((a, b) => a.price - b.price);
    }

    renderServicesTable(filteredList);
}