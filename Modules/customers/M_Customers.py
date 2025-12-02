
from Functions.CRUD import Methods
from collections import defaultdict

class M_Customers:
    #CRUD Basico
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

    #CRUD Avanzado


    def GetFilterCustomers(self,datos,asc, ordenar_por=None, agrupar_por=None):
        """
        datos: dict -> tu diccionario de clientes
        ordenar_por: str o list[str] -> claves internas por las que ordenar
        agrupar_por: str -> clave interna por la que agrupar
        """

        # Normalizo ordenar_por para permitir una cadena o lista
        if isinstance(ordenar_por, str):
            ordenar_por = [ordenar_por]

        # 1. ORDENAR (si se especificó)
        if ordenar_por:
            datos_ordenados = sorted(
                datos.items(),
                key=lambda item: tuple(item[1][k] for k in ordenar_por),
                reverse=not asc
            )
        else:
            datos_ordenados = list(datos.items())  # sin ordenar

        # 2. AGRUPAR (si se especificó)
        if agrupar_por:
            agrupados = defaultdict(list)
            for clave, info in datos_ordenados:
                agrupados[info[agrupar_por]].append({clave: info})
            return dict(agrupados)

        # Si no hay agrupamiento, devuelvo dict ordenado
        return dict(datos_ordenados)
