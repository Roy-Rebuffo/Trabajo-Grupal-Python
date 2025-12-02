let serviceData = {
    name: "",
    category: "",
    price: 0,
    duration_minutes: 0,
    active: false
};

function collectServiceData() {
    return {
        name: document.getElementById('s_name').value,
        category: document.getElementById('s_category').value,
        price: parseFloat(document.getElementById('s_price').value),
        duration_minutes: parseInt(document.getElementById('s_duration').value),
        active: document.getElementById('s_active').checked
    };
}

function SendServiceData() {

    const data = collectServiceData();

    // DEBUG
    console.log("Enviando:", data);

    // Enviar a Python
    pywebview.api.services_addService(data)
        .then(() => console.log("Servicio añadido correctamente"))
        .catch(err => console.error("ERROR:", err));
}