from Modules.customers.M_Customers import M_Customers
from Modules.usuarios.M_users import M_users
clientes=M_Customers()
usuarios = M_users()

modules={
    
    "customers":clientes,
    "users":usuarios
    
    }