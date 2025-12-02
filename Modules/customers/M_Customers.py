import operator
from datetime import datetime
import pprint
from CRUD import Methods
from collections import defaultdict

OPERADORES = {
    "==": operator.eq,
    "!=": operator.ne,
    ">":  operator.gt,
    "<":  operator.lt,
    ">=": operator.ge,
    "<=": operator.le
}


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

    def Filter_customers(self, criterios,restrition,customers):
        """
        Filtra los clientes según un criterio y valor dados.
        criterio: [{}] -> lista de diccionarios con clave: ,
        claves del diccionario:
        key_name: nombre de la clave interna a filtrar
        value: valor a comparar
        comparador: tipo de comparación (==, !=, >, <, >=, <=, between)
        """
        for criterio in criterios:
            key_name = criterio['key_name']
            comparador = criterio['comparador']
            valor = criterio['valor']

            if key_name not in customers[next(iter(customers))]:
                continue  # Salta si la clave no existe

            tipo_dato = type(customers[next(iter(customers))][key_name])
            if 'type' in criterio:
                if criterio['type'] == 'date':
                    tipo_dato = datetime
            print(f"Tipo de dato para {key_name}: {tipo_dato}")
            if tipo_dato == bool:
                valor = bool(valor)
            elif tipo_dato == int or tipo_dato == float:
                valor = float(valor)
            elif tipo_dato == str:
                valor = str(valor)
            elif tipo_dato == datetime:
                if comparador == 'between':
                    valor = [datetime.strptime(v, "%Y-%m-%d") for v in valor]
                else:
                    valor = datetime.strptime(valor, "%Y-%m-%d")

            operador_func = OPERADORES.get(comparador)

            if not operador_func:
                continue  # Salta si el comparador no es válido

            clientes_filtrados = {}
            for clave, info in customers.items():
                dato_cliente = info[key_name]
                if tipo_dato == datetime:
                    dato_cliente = datetime.strptime(dato_cliente, "%Y-%m-%d")

                if comparador == 'between' and tipo_dato == datetime:
                    if valor[0] <= dato_cliente <= valor[1]:
                        clientes_filtrados[clave] = info
                else:
                    if not operador_func(dato_cliente, valor):
                        if clave in clientes_filtrados and restrition==True:
                            del clientes_filtrados[clave] 
                        continue
                    else:
                        clientes_filtrados[clave] = info
                    

            customers = clientes_filtrados
        return customers
             

    def Get_sorted_and_grouped_customers(self,datos,asc, ordenar_por=None, agrupar_por=None):
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

if __name__ == "__main__":
    mc = M_Customers()
    clientes = mc.GetCustomers()
    criterios = [
        {"key_name": "age", "comparador": ">", "valor": 30},
        {"key_name": "active", "comparador": "==", "valor": True},
        {"key_name": "date", "comparador": "between", "valor": [ "1988-01-01","1989-01-01"],"type": "date"}
    ]
    filtrados = mc.Filter_customers(criterios,True, clientes)
    print("Filtrados:", filtrados)