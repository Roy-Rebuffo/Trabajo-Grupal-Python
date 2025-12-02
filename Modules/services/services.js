// ==========================
//  VARIABLES Y ARRAYS
// ==========================
let servicesList = [];   // Se cargará desde Python
let filteredList = [];   // Lista tras filtros/orden

// ==========================
//  CARGAR SERVICIOS AL INICIO
// ==========================
window.addEventListener('pywebviewready', () => {
    console.log("PyWebView listo.");
    loadServices();
});

// Pedir lista de servicios a Python
function loadServices() {
    pywebview.api.services_getServices()
        .then(data => {
            servicesList = data;
            filteredList = [...servicesList];
            renderServicesTable(filteredList);
        })
        .catch(err => console.error("Error al cargar servicios:", err));
}

// ==========================
//  PINTAR TABLA
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
            <td><button class="delete-btn" onclick="deleteService(${service.id})">Delete</button></td>
        `;

        tbody.appendChild(row);
    });
}

// ==========================
//  RECOGER DATOS DEL FORM
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
//  AÑADIR SERVICIO
// ==========================
function SendServiceData() {
    const data = collectServiceData();

    console.log("Enviando:", data);

    pywebview.api.services_addService(data)
        .then(() => {
            console.log("Servicio añadido correctamente");
            loadServices(); // recargar tabla
        })
        .catch(err => console.error("ERROR:", err));
}

// ==========================
//  BORRAR SERVICIO
// ==========================
function deleteService(id) {
    if (!confirm("¿Seguro que deseas borrar este servicio?")) return;

    pywebview.api.services_deleteService(id)
        .then(() => {
            console.log("Servicio borrado");
            loadServices();
        })
        .catch(err => console.error("Error al borrar servicio:", err));
}

// ==========================
//  FILTROS
// ==========================
function filterServices() {
    const cat = document.getElementById("filter_category").value.trim().toLowerCase();
    const sortType = document.getElementById("filter_sort").value;

    filteredList = servicesList.filter(s =>
        s.category.toLowerCase().includes(cat)
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