from Functions.CRUD import Methods

class M_Services:
    def getServices(self):
        return Methods.GetAll("Data/servicios.json")

    def addMultipleServices(self, services):
        Methods.AddMany("Data/servicios.json", services)

    def addService(self, service_data):
        Methods.AddOne("Data/servicios.json", service_data)

    def deleteService(self, service_id):
        Methods.Delete("Data/servicios.json", service_id)

    def updateService(self, service_id, new_data):
        Methods.Update("Data/servicios.json", service_id, new_data)

    def getServiceByID(self, service_id):
        return Methods.GetOneById("Data/servicios.json", service_id)
    
  