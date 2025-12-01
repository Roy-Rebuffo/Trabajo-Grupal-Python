let serviceData = {
    "name": "",
    "category": "",
    "price": 0,
    "duration_minutes": 0,
    "active": false
};

function collectServiceData() {
    serviceData.name = document.getElementById('s_name').value;
    serviceData.category = document.getElementById('s_category').value;
    serviceData.price = parseFloat(document.getElementById('s_price').value);
    serviceData.duration_minutes = parseInt(document.getElementById('s_duration').value);
    serviceData.active = document.getElementById('s_active').checked;
}

function SendServiceData() {
    
    pywebview.api.service_getServices().then(data => console.log("OK:", data)).catch(err => console.error("ERROR:", err));
        collectServiceData();
        pywebview.api.service.collectServiceData(serviceData);
}

