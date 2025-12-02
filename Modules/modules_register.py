from Modules.customers.M_Customers import M_Customers
from Modules.services.M_Services import M_Services

clientes=M_Customers()
servicios=M_Services()
from Modules.products.M_Products import M_Products

clientes=M_Customers()
productos=M_Products()

modules={
    
    "customers":clientes,
    "products" :productos,
    "services":servicios

    }
