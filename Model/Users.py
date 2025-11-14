try:
    with open('clientes.txt', 'x') as fich:
        print("Fichero creado correctamente")
except FileExistsError:
    print("El fichero ya existía, no se creó uno nuevo.")

lista = []

try:
    with open('clientes.txt', 'w') as fich:
        for i in range(3):
            nom = input('Escriba su nombre: ')
            ape1 = input(f'Escriba el {i+1}er apellido: ')
            ape2 = input(f'Escriba el {i+1}º apellido 2: ')

            registro = f"{nom};{ape1};{ape2}\n"

            fich.write(registro)

            lista.append(registro)

except FileNotFoundError as error:
    print("Error:", error)

else:
    print("Datos guardados correctamente:")
    print(lista)

finally:
    print("Fichero cerrado correctamente.")