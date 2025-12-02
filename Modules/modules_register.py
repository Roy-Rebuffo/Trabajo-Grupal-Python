from Modules.customers.M_Customers import M_Customers

from Modules.usuarios.M_users import M_users
clientes=M_Customers()
usuarios = M_users()

from Modules.products.M_Products import M_Products

clientes=M_Customers()
productos=M_Products()


modules={
    
    "customers":clientes,

    "users":usuarios,

    "products" :productos

    
    }