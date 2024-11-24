// Seleccionar el formulario
const form = document.querySelector('form');

// Definir las credenciales específicas
const usuarioCorrecto = "maxifuentes";  // Aquí defines el nombre de usuario
const contrasenaCorrecta = "coderhouse"; // Aquí defines la contraseña

// Agregar un evento al formulario
form.addEventListener('submit', function (event) {
    event.preventDefault(); // Evita el envío predeterminado del formulario

    // Obtener los valores de los inputs
    const usuarioIngresado = document.querySelector('input[name="username"]').value;
    const contrasenaIngresada = document.querySelector('input[name="password"]').value;

    // Validar si el usuario y la contraseña son correctos
    if (usuarioIngresado === usuarioCorrecto && contrasenaIngresada === contrasenaCorrecta) {
        // Redirige a la página deseada si las credenciales son correctas
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




