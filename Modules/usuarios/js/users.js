function enviarUsuario(){
    const usuario = {
        nombre : document.getElementById("nombre").value,
        apellido: document.getElementById("apellido").value,
        email: document.getElementById("email").value,
        telefono: document.getElementById("telefono").value,
        ciudad: document.getElementById("ciudad").value,
        fecha_contrato: document.getElementById("fecha").value,
        rol: document.getElementById("rol").value
    };

    pywebview.api.agregar_usuario(usuario)
        .then(()=> alert("Usuario registrado correctamente"))
        .catch(err => console.error("Error:",err))

}