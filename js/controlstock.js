// busca y guarda los elementos del HTML que vamos a usar
const listaProductosElemento = document.getElementById('lista-productos');
const formularioProducto = document.getElementById('formulario-producto');
const nombreProductoInput = document.getElementById('nombre-producto');
const cantidadProductoInput = document.getElementById('cantidad-producto');
const precioProductoInput = document.getElementById('precio-producto');

// lista inicial de productos para cargar en el simulador
const productosIniciales = [
    { nombre: 'Intel Core i9 14900KS', cantidad: 20, precio: 900 },
    { nombre: 'ASUS ROG Strix GeForce RTX 4090', cantidad: 8, precio: 3000 },
    { nombre: 'Zotac GeForce RTX 4060 Ti 16GB ', cantidad: 31, precio: 550 },
    { nombre: 'Razer BLACKSHARK V2 PRO Wireless', cantidad: 3, precio: 300 },
    { nombre: 'Razer BlackWidow V4 Pro RGB ', cantidad: 15, precio: 240 }
];

// inicializa los productos en el localStorage solo si no hay productos guardados
function inicializarProductos() {
    let productos = JSON.parse(localStorage.getItem('productos'));
    if (!productos || productos.length === 0) {
        localStorage.setItem('productos', JSON.stringify(productosIniciales));
    }
}

// obtiene los productos del localStorage al inicio
let productos = JSON.parse(localStorage.getItem('productos')) || productosIniciales;

// muestra los productos
function mostrarProductos() {
    listaProductosElemento.innerHTML = ''; 
    // si no hay productos aagrega un mensaje 
    if (productos.length === 0) {
        const mensajeVacío = document.createElement('div');
        mensajeVacío.classList.add('mensaje-vacio');
        mensajeVacío.textContent = 'El stock está vacío.';
        listaProductosElemento.appendChild(mensajeVacío);
        return; 
    }
    // recorre cada producto en el array productos y su índice
    productos.forEach((producto, index) => {
        const card = document.createElement('div');
        card.classList.add('producto');
        card.innerHTML = `
            <span class="producto-nombre">${producto.nombre} - Cantidad: ${producto.cantidad} - Precio: $${producto.precio.toFixed(2)}</span>
            <div class="acciones">
                <input type="number" class="cantidad-quitar" placeholder="Quitar" min="1" max="${producto.cantidad}">
                <button class="boton-quitar" data-index="${index}">Quitar</button>
                <button class="boton-eliminar" data-index="${index}">Eliminar</button>
            </div>
        `;
        listaProductosElemento.appendChild(card);
    });
}

// actualiza el localStorage con el array de productos
function actualizarStorage() {
    localStorage.setItem('productos', JSON.stringify(productos));
}

// agrega un producto al almacenamiento y lo muestra en el array
function agregarProducto(nombre, cantidad, precio) {
    const nuevoProducto = { nombre, cantidad, precio };
    productos.push(nuevoProducto);
    actualizarStorage();
    mostrarProductos();
    Swal.fire({
        title: '¡Producto agregado!',
        text: `El producto "${nombre}" se ha agregado correctamente al stock.`,
        icon: 'success',
        confirmButtonText: 'Aceptar',
        backdrop: false,
    });
}

// quita una cantidad específica de un producto o lo elimina si la cantidad es 0
function quitarProducto(index, cantidadQuitar) {
    const producto = productos[index];
    if (producto) {
        // verifica que la cantidad a quitar no sea mayor que la cantidad en stock
        if (cantidadQuitar <= producto.cantidad) {
            producto.cantidad -= cantidadQuitar;
            if (producto.cantidad <= 0) {
                productos.splice(index, 1);  // elimina el producto si la cantidad llega a 0
            }
            actualizarStorage(); // actualiza el localStorage
            mostrarProductos();
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
function eliminarProducto(index) {
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
                actualizarStorage();
                mostrarProductos(); // Volver a mostrar productos después de eliminar
                Swal.fire({
                    title: '¡Éxito!',
                    text: `Producto '${productoEliminado[0].nombre}' eliminado del stock.`,
                    icon: 'success',
                    confirmButtonText: 'Aceptar',
                    backdrop: false,
                });
            } else {
                mostrarProductos(); // si cancela, solo muestra los productos
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
    if (nombre && cantidad > 0 && precio >= 0) {
        agregarProducto(nombre, cantidad, precio);
        nombreProductoInput.value = '';
        cantidadProductoInput.value = '';
        precioProductoInput.value = '';
    }
});

// evento para quitar o eliminar productos desde los botones
listaProductosElemento.addEventListener('click', (event) => {
    if (event.target.classList.contains('boton-quitar')) {
        const index = event.target.getAttribute('data-index');
        const cantidadInput = event.target.previousElementSibling;
        const cantidadQuitar = parseInt(cantidadInput.value) || 0;
        if (cantidadQuitar > 0) {
            quitarProducto(index, cantidadQuitar);
            cantidadInput.value = '';
        }
    } else if (event.target.classList.contains('boton-eliminar')) {
        const index = event.target.getAttribute('data-index');
        eliminarProducto(index);
    }
});

// inicializa la aplicación cargando productos iniciales si no hay en localStorage
inicializarProductos();
mostrarProductos();
