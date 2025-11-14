try:
    with open('productos.txt', 'x') as fich:
        print("Fichero creado correctamente")
except FileExistsError:
    print("El fichero ya existía, no se creó uno nuevo.")

lista = []

try:
    with open('productos.txt', 'w') as fich:
        for i in range(3):
            nom = input('Escriba el nombre del producto: ')
            cant = input(f'Escriba la cantidad del producto (ml,l,..): ')
            marca = input(f'Escriba marca: ')

            registro = f"{nom};{cant};{marca}\n"

            fich.write(registro)

            lista.append(registro)

except FileNotFoundError as error:
    print("Error:", error)

else:
    print("Datos guardados correctamente:")
    print(lista)

finally:
    print("Fichero cerrado correctamente.")