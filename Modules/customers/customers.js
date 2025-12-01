let customerData = {"name":"","surname":"","age":0,"email":""};



function collectCustomerData() {
    customerData.name = document.getElementById('name').value;
    customerData.surname = document.getElementById('surname').value;
    customerData.age = parseInt(document.getElementById('age').value);
    customerData.email = document.getElementById('email').value;
}

function SentData() {
    collectCustomerData();

    pywebview.api.customers_AddCustomer(customerData)
}



window.addEventListener('pywebviewready', function () {

    console.log("pywebview:", pywebview);
    console.log("apis disponibles:", Object.keys(pywebview.api));

    listarClientes();
},{once: true});

function listarClientes() {
    pywebview.api.customers_GetCustomers().then((data) => {
        let customerList = document.getElementById('customerList');
        customerList.innerHTML = '';

        Object.keys(data).forEach(key => {
            const customer = data[key];

            let listItem = document.createElement('li');

            listItem.innerHTML = `
                <div class="customer-card">
                    <h3>${customer.name} ${customer.surname}</h3>
                    <div class="customer-details">
                    <p><strong>Edad:</strong> ${customer.age}</p>
                    <p><strong>Ciudad:</strong> ${customer.city}</p>
                    <p><strong>Email:</strong> ${customer.email}</p>
                    <p><strong>Teléfono:</strong> ${customer.phone}</p>
                    <p><strong>Activo:</strong> ${customer.active ? "Sí" : "No"}</p>
                    <p><strong>Cantidad de compras:</strong> ${customer.pucharses_amount}</p>
                    <p><strong>Total gastado:</strong> ${customer.total_spent}€</p>
                    </div>
                </div>
            `;

            customerList.appendChild(listItem);
        });
    });
}

