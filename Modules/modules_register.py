from Modules.customers.M_Customers import M_Customers
from Modules.products.M_Products import M_Products

clientes=M_Customers()
productos=M_Products()

modules={
    
    "customers":clientes,
    "products" :productos,
    
    }