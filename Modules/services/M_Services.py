from Functions.CRUD import Methods
import json # Aunque no se usa directamente aquí, es útil si manejas JSON

class M_Services:
    
    # ---------------------------
    #  OPERACIONES CRUD
    # ---------------------------

    def getServices(self):
        """Devuelve todos los servicios como un diccionario."""
        return Methods.GetAll("Data/servicios.json")

    def addMultipleServices(self, services):
        """Añade múltiples servicios."""
        Methods.AddMany("Data/servicios.json", services)

    def addService(self, service_data):
        """Añade un solo servicio."""
        Methods.AddOne("Data/servicios.json", service_data)

    def deleteService(self, service_id):
        """Borra un servicio por ID."""
        Methods.Delete("Data/servicios.json", service_id)

    def updateService(self, service_id, new_data):
        """Actualiza los datos de un servicio por ID."""
        Methods.Update("Data/servicios.json", service_id, new_data)

    def getServiceByID(self, service_id):
        """Obtiene un servicio por ID."""
        return Methods.GetOneById("Data/servicios.json", service_id)
        
    # ---------------------------
    #  ESTADÍSTICAS (NUEVO)
    # ---------------------------

    def getServicesStats(self):
        """
        Calcula y devuelve estadísticas clave sobre los servicios.
        """
        all_services = self.getServices()
        
        # Manejo de caso sin servicios
        if not all_services:
            return {
                "total_services": 0,
                "active_services": 0,
                "categories": {},
                "avg_price": 0.0,
                "avg_duration": 0.0
            }

        services_list = list(all_services.values())
        
        total_services = len(services_list)
        
        # 1. Servicios activos
        active_services = sum(1 for s in services_list if s.get('active', False))

        # 2. Conteo de categorías
        categories = {}
        for service in services_list:
            category = service.get('category', 'N/A')
            categories[category] = categories.get(category, 0) + 1

        # 3. Precios y Duraciones para promedios
        prices = [s.get('price', 0) for s in services_list]
        durations = [s.get('duration_minutes', 0) for s in services_list]

        # 4. Cálculo de promedios
        if total_services > 0:
            avg_price = sum(prices) / total_services
            avg_duration = sum(durations) / total_services
        else:
            avg_price = 0.0
            avg_duration = 0.0

        # Devolver el resultado, redondeando los promedios
        return {
            "total_services": total_services,
            "active_services": active_services,
            "categories": categories,
            "avg_price": round(avg_price, 2),
            "avg_duration": round(avg_duration, 0) 
        }