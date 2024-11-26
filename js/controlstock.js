// verifica si iniciaste sesión
const autenticado = localStorage.getItem('autenticado');

if (autenticado !== 'true') {
    Swal.fire({
        title: '¡Acceso denegado!',
        text: 'Debes iniciar sesión para acceder a esta página.',
        icon: 'warning',
        confirmButtonText: 'Ir al inicio',
        backdrop: `
            linear-gradient(150deg, #403864, #000000)
        `,
    }).then(() => {
        window.location.href = '../index.html';
    });
}

// busca y guarda los elementos del HTML que vamos a usar
const listaProductosElemento = document.getElementById('lista-productos');
const formularioProducto = document.getElementById('formulario-producto');
const nombreProductoInput = document.getElementById('nombre-producto');
const cantidadProductoInput = document.getElementById('cantidad-producto');
const precioProductoInput = document.getElementById('precio-producto');
const logoutButton = document.getElementById('logoutButton');

// funcion para mostrar mensajes de error en el DOM
function mostrarError(mensaje) {
    const errorElemento = document.getElementById('error-mensaje');
    const mensajeTexto = document.getElementById('mensaje-texto');
    mensajeTexto.textContent = mensaje;
    errorElemento.classList.add('mostrar');

    // boton para cerrar el mensaje
    const cerrarError = document.getElementById('cerrar-error');
    cerrarError.addEventListener('click', () => {
        errorElemento.classList.remove('mostrar');
    });
}

// errores en la carga de JSON
async function cargarProductosDesdeJSON() {
    try {
        const response = await fetch('../json/productos.json');
        if (!response.ok) {
            throw new Error('No se pudo cargar el archivo JSON.');
        }
        return await response.json();
    } catch (error) {
        mostrarError('Error al cargar el archivo de productos. Intente nuevamente más tarde.');
        return [];
    }
}

// obtiene los productos del localStorage o carga los productos desde el JSON
async function obtenerProductos() {
    const productosStorage = localStorage.getItem('productos');
    if (productosStorage) {
        return JSON.parse(productosStorage);
    } else {
        const productosDesdeJSON = await cargarProductosDesdeJSON();
        if (productosDesdeJSON.length > 0) {
            localStorage.setItem('productos', JSON.stringify(productosDesdeJSON));
        }
        return productosDesdeJSON;
    }
}

// muestra los productos en el DOM
function mostrarProductos(productos) {
    listaProductosElemento.innerHTML = '';

    if (productos.length === 0) {
        const mensajeVacío = document.createElement('div');
        mensajeVacío.classList.add('mensaje-vacio');
        mensajeVacío.textContent = 'El stock está vacío.';
        listaProductosElemento.appendChild(mensajeVacío);
        return;
    }

    productos.forEach((producto, index) => {
        const card = document.createElement('div');
        card.classList.add('producto');
        card.innerHTML = `
            <span class="producto-nombre">${producto.nombre} - Cantidad: ${producto.cantidad} - Precio: $${producto.precio.toFixed(2)}</span>
            <div class="acciones">
                <input type="number" class="cantidad-quitar" placeholder="Quitar" min="1" max="${producto.cantidad}">
                <button class="boton-quitar" data-index="${index}">Quitar</button>
                <input type="number" class="cantidad-quitar" placeholder="Agregar" min="1">
                <button class="boton-agregar" data-index="${index}">Agregar</button>
                <button class="boton-eliminar" data-index="${index}">Eliminar</button>
            </div>
        `;
        listaProductosElemento.appendChild(card);
    });
}

// actualiza el localStorage con el array de productos
function actualizarStorage(productos) {
    localStorage.setItem('productos', JSON.stringify(productos));
}

// agrega un producto al almacenamiento y lo muestra en el array
function agregarProducto(nombre, cantidad, precio, productos) {
    const nuevoProducto = { nombre, cantidad, precio };
    productos.push(nuevoProducto);
    actualizarStorage(productos);
    mostrarProductos(productos);
    Swal.fire({
        title: '¡Producto agregado!',
        text: `El producto "${nombre}" se ha agregado correctamente al stock.`,
        icon: 'success',
        confirmButtonText: 'Aceptar',
        backdrop: false,
    });
}

// quita una cantidad específica de un producto o lo elimina si la cantidad es 0
function quitarProducto(index, cantidadQuitar, productos) {
    const producto = productos[index];
    if (producto) {
        if (cantidadQuitar <= producto.cantidad) {
            producto.cantidad -= cantidadQuitar;
            if (producto.cantidad <= 0) {
                productos.splice(index, 1);
            }
            actualizarStorage(productos);
            mostrarProductos(productos);
            Swal.fire({
                title: '¡Éxito!',
                text: `Se han quitado ${cantidadQuitar} unidad(es) de "${producto.nombre}" del stock.`,
                icon: 'success',
                confirmButtonText: 'Aceptar',
                backdrop: false,
            });
        } else {
            Swal.fire({
                title: '¡Error!',
                text: `No puedes quitar más unidades de las que están disponibles (Stock: ${producto.cantidad}).`,
                icon: 'error',
                confirmButtonText: 'Aceptar',
                backdrop: false,
            });
        }
    }
}

// elimina un producto completamente del almacenamiento
function eliminarProducto(index, productos) {
    const productoEliminado = productos.splice(index, 1);
    if (productoEliminado.length > 0) {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `Vas a eliminar el producto "${productoEliminado[0].nombre}" del stock. Esta acción no se puede deshacer.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            backdrop: false,
        }).then((result) => {
            if (result.isConfirmed) {
                actualizarStorage(productos);
                mostrarProductos(productos);
                Swal.fire({
                    title: '¡Éxito!',
                    text: `Producto '${productoEliminado[0].nombre}' eliminado del stock.`,
                    icon: 'success',
                    confirmButtonText: 'Aceptar',
                    backdrop: false,
                });
            } else {
                mostrarProductos(productos);
            }
        });
    }
}

// evento para agregar un producto por el formulario
formularioProducto.addEventListener('submit', (event) => {
    event.preventDefault();

    const nombre = nombreProductoInput.value.trim();
    const cantidad = parseInt(cantidadProductoInput.value);
    const precio = parseFloat(precioProductoInput.value);

    // valida 
    if (!nombre || cantidad <= 0 || precio <= 0) {
        mostrarError('Por favor, ingresa valores válidos. La cantidad y el precio deben ser mayores a 0.');
        return;
    }

    obtenerProductos().then((productos) => {
        // verifica si el nombre ya existe
        const productoExistente = productos.find((producto) => producto.nombre.toLowerCase() === nombre.toLowerCase());

        if (productoExistente) {
            mostrarError(`El producto "${nombre}" ya existe en el stock. Cambia el nombre o actualiza su cantidad.`);
            return;
        }

        // si pasa la validacion agregar el producto
        agregarProducto(nombre, cantidad, precio, productos);

        // limpiar campos del formulario
        nombreProductoInput.value = '';
        cantidadProductoInput.value = '';
        precioProductoInput.value = '';
    });
});

// evento para quitar, agregar o eliminar productos desde los botones
listaProductosElemento.addEventListener('click', (event) => {
    obtenerProductos().then((productos) => {
        if (event.target.classList.contains('boton-quitar')) {
            // Botón de quitar producto
            const index = event.target.getAttribute('data-index');
            const cantidadInput = event.target.previousElementSibling;
            const cantidadQuitar = parseInt(cantidadInput.value) || 0;
            if (cantidadQuitar > 0) {
                quitarProducto(index, cantidadQuitar, productos);
                cantidadInput.value = '';
            }
        } else if (event.target.classList.contains('boton-agregar')) {
            // Botón de agregar producto
            const index = event.target.getAttribute('data-index');
            const cantidadInput = event.target.previousElementSibling;
            const cantidadAgregar = parseInt(cantidadInput.value) || 0;
            if (cantidadAgregar > 0) {
                agregarCantidadProducto(index, cantidadAgregar, productos);
                cantidadInput.value = '';
            }
        } else if (event.target.classList.contains('boton-eliminar')) {
            // Botón de eliminar producto
            const index = event.target.getAttribute('data-index');
            eliminarProducto(index, productos);
        }
    });
});

// función para agregar cantidad a un producto existente
function agregarCantidadProducto(index, cantidadAgregar, productos) {
    const producto = productos[index];
    if (producto) {
        producto.cantidad += cantidadAgregar;
        actualizarStorage(productos);
        mostrarProductos(productos);

        // SweetAlert de éxito
        Swal.fire({
            title: '¡Cantidad agregada!',
            text: `Se han agregado ${cantidadAgregar} unidad(es) a "${producto.nombre}". Nueva cantidad: ${producto.cantidad}.`,
            icon: 'success',
            confirmButtonText: 'Aceptar',
            backdrop: false,
        });
    }
}


// inicializa la aplicación cargando productos desde el JSON o localStorage
obtenerProductos().then((productos) => {
    mostrarProductos(productos);
});

// cerrar sesión
logoutButton.addEventListener('click', () => {
    Swal.fire({
        title: 'Cerrar sesión',
        text: '¿Estás seguro de que deseas cerrar sesión?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, cerrar sesión',
        cancelButtonText: 'Cancelar',
        backdrop: true,
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem('autenticado');
            window.location.href = '../index.html';
        }
    });
});