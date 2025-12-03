from Modules.customers.M_Customers import M_Customers
from Modules.services.M_Services import M_Services
from Modules.products.M_Products import M_Products
from Modules.Facturas.M_Facturas import M_Facturas
from Modules.usuarios.M_users import M_users

clientes=M_Customers()
usuarios = M_users()
servicios=M_Services()
productos=M_Products()
facturas = M_Facturas()


modules={
    
    "customers":clientes,
    "users":usuarios,
    "products" :productos,
    "services":servicios,
    "Facturas":facturas
    }

    

    
    
