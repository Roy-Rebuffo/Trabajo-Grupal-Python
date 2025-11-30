let customerData = {"name":"","surname":"","age":0,"email":""};



function collectCustomerData() {
    customerData.name = document.getElementById('name').value;
    customerData.surname = document.getElementById('surname').value;
    customerData.age = parseInt(document.getElementById('age').value);
    customerData.email = document.getElementById('email').value;
}

function SentData() {
    pywebview.api.customers_GetCustomers()
  .then(data => console.log("OK:", data))
  .catch(err => console.error("ERROR:", err));
    collectCustomerData();
    pywebview.api.customers_AddCustomer(customerData)
}