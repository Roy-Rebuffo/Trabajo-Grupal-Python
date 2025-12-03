let customerData =  {
    "name": "",
    "surname": "",
    "date": null,
    "city": "",
    "email": "",
    "phone": null,
    "active": false,
    "pucharses_amount": 0,
    "total_spent": 0.0,
};

let customers = {};
let original_customers = {};
let customerList = document.getElementById('customerList');

function collectCustomerData() {
    customerData.name = document.getElementById('name').value;
    customerData.surname = document.getElementById('surname').value;
    customerData.date = document.getElementById('date').value;
    customerData.email = document.getElementById('email').value;
    customerData.city = document.getElementById('city').value;
    customerData.phone = document.getElementById('phone').value;
    customerData.active = document.getElementById('active').checked;
}

function SentCustomer() {
    collectCustomerData();
    pywebview.api.customers_AddCustomer(customerData).then(() => {
        listarClientes(); // refrescar lista después de agregar
    });
}

function processCustomerData() {
    const orderBy = [...document.querySelectorAll('input[name="order"]:checked')]
                    .map(x => x.value);

    const orderDir = document.getElementById("orderDirection").checked; // true = asc, false = desc
    const groupBy = document.getElementById("groupBy").value;

    // Llamada al backend con PyWebView
    pywebview.api.customers_Get_sorted_and_grouped_customers(original_customers, orderDir, orderBy, groupBy)
        .then((data) => {
            customers = data; // actualizar variable global con los datos procesados
            RefrescarClientes(); // refrescar UL con los datos
        });
}

window.addEventListener('pywebviewready', function () {
    listarClientes();
}, {once: true});

function RefrescarClientes() {
    customerList.innerHTML = '';

    // En caso de que los datos estén agrupados
    Object.keys(customers).forEach(key => {
        const customerOrGroup = customers[key];

        if (Array.isArray(customerOrGroup)) {
            // Agrupamiento: customerOrGroup es un array de clientes
            customerOrGroup.forEach(item => {
                const customer = item[Object.keys(item)[0]] || item; // soporte agrupado o normal
                let listItem = document.createElement('li');
                listItem.innerHTML = `
                    <div class="customer-card">
                        <h3>${customer.name} ${customer.surname}</h3>
                        <div class="customer-details">
                            <p><strong>Fecha de Nacimiento:</strong> ${customer.date || ''}</p>
                             <p><strong>Edad:</strong> ${customer.age}</p>
                            <p><strong>Ciudad:</strong> ${customer.city}</p>
                            <p><strong>Email:</strong> ${customer.email}</p>
                            <p><strong>Teléfono:</strong> ${customer.phone || ''}</p>
                            <p><strong>Activo:</strong> ${customer.active ? "Sí" : "No"}</p>
                            <p><strong>Cantidad de compras:</strong> ${customer.pucharses_amount}</p>
                            <p><strong>Total gastado:</strong> ${customer.total_spent}€</p>
                        </div>
                    </div>
                `;
                customerList.appendChild(listItem);
            });
        } else {
            // No agrupado: customerOrGroup es el cliente directamente
            const customer = customerOrGroup;
            let listItem = document.createElement('li');
            listItem.innerHTML = `
                <div class="customer-card">
                    <h3>${customer.name} ${customer.surname}</h3>
                    <div class="customer-details">
                        <p><strong>Fecha de Nacimiento:</strong> ${customer.date || ''}</p>
                         <p><strong>Edad:</strong> ${customer.age}</p>
                        <p><strong>Ciudad:</strong> ${customer.city}</p>
                        <p><strong>Email:</strong> ${customer.email}</p>
                        <p><strong>Teléfono:</strong> ${customer.phone || ''}</p>
                        <p><strong>Activo:</strong> ${customer.active ? "Sí" : "No"}</p>
                        <p><strong>Cantidad de compras:</strong> ${customer.pucharses_amount}</p>
                        <p><strong>Total gastado:</strong> ${customer.total_spent}€</p>
                    </div>
                </div>
            `;
            customerList.appendChild(listItem);
        }
    });
}

function listarClientes() {
    pywebview.api.customers_GetCustomers().then((data) => {
        customers = data;
        original_customers = data; // Guardar copia original
        RefrescarClientes();
    });
}
