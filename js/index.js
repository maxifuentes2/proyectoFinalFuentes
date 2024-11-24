// seleccionar el formulario
const form = document.querySelector('form');

// definir las credenciales específicas
const usuarioCorrecto = "maxifuentes";  // Aquí defines el nombre de usuario
const contrasenaCorrecta = "coderhouse"; // Aquí defines la contraseña

// agregar un evento al formulario
form.addEventListener('submit', function (event) {
    event.preventDefault(); // Evita el envío predeterminado del formulario

    // obtener los valores de los inputs
    const usuarioIngresado = document.querySelector('input[name="username"]').value;
    const contrasenaIngresada = document.querySelector('input[name="password"]').value;

    // validar si el usuario y la contraseña son correctos
    if (usuarioIngresado === usuarioCorrecto && contrasenaIngresada === contrasenaCorrecta) {
        // si los datos son correctos nos lleva a la otra pagina
        window.location.href = './pages/controlstock.html';
    } else {
        Swal.fire({
            title: '¡Error!',
            text: `El usuario o la contraseña son inválidos`,
            icon: 'error',
            confirmButtonText: 'Aceptar',
            backdrop: false,
        });      
    }
});




