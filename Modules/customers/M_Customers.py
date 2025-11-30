
from Functions.CRUD import Methods

class M_Customers:

    def GetCustomers(self):
        return Methods.GetAll("Data/clientes.json")

    def AddCustomers(self,customers):
        Methods.AddMany("Data/clientes.json", customers)

    def DeleteCustomer(self,customer_id):
        Methods.Delete("Data/clientes.json", customer_id)

    def updateCustomer(self,customer_id, new_data):
        Methods.update("Data/clientes.json", customer_id, new_data)

    def AddCustomer(self,customer_data):
        Methods.AddOne("Data/clientes.json", customer_data)

    def GetCustomerById(self,customer_id):
        return Methods.GetOneById("Data/clientes.json", customer_id)
