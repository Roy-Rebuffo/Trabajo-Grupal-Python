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
    }



function collectCustomerData() {
    customerData.name = document.getElementById('name').value;
    customerData.surname = document.getElementById('surname').value;
    customerData.date = document.getElementById('date').value;
    customerData.email = document.getElementById('email').value;
 customerData.city = document.getElementById('city').value;
  customerData.phone = document.getElementById('phone').value;
  customerData.active = document.getElementById('active').value;

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
  //Para cualquier modulo es lo mismo, solo cambiar el nombre del metodo y los datos que se muestran
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
                    <p><strong>Fecha de Nacimiento:</strong> ${customer.date}</p>
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

