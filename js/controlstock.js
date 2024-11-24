// busca y guarda los elementos del HTML que vamos a usar
const listaProductosElemento = document.getElementById('lista-productos');
const formularioProducto = document.getElementById('formulario-producto');
const nombreProductoInput = document.getElementById('nombre-producto');
const cantidadProductoInput = document.getElementById('cantidad-producto');
const precioProductoInput = document.getElementById('precio-producto');

// función para cargar los productos desde el archivo JSON
async function cargarProductosDesdeJSON() {
    try {
        const response = await fetch('./data/productos.json'); 
        const productos = await response.json(); 
    } catch (error) {
        console.error('Error al cargar el archivo JSON:', error);
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
        return productosDesdeJSON;
    }
}

// muestra los productos en el DOM
function mostrarProductos(productos) {
    listaProductosElemento.innerHTML = ''; 
    
    // si no hay productos agrega un mensaje
    if (productos.length === 0) {
        const mensajeVacío = document.createElement('div');
        mensajeVacío.classList.add('mensaje-vacio');
        mensajeVacío.textContent = 'El stock está vacío.';
        listaProductosElemento.appendChild(mensajeVacío);
        return;
    }

    // recorrer los productos y mostrarlos en el DOM
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

    if (nombre && cantidad > 0 && precio >= 0) {
        obtenerProductos().then(productos => {
            agregarProducto(nombre, cantidad, precio, productos);
        });
        nombreProductoInput.value = '';
        cantidadProductoInput.value = '';
        precioProductoInput.value = '';
    }
});

// evento para quitar o eliminar productos desde los botones
listaProductosElemento.addEventListener('click', (event) => {
    obtenerProductos().then(productos => {
        if (event.target.classList.contains('boton-quitar')) {
            const index = event.target.getAttribute('data-index');
            const cantidadInput = event.target.previousElementSibling;
            const cantidadQuitar = parseInt(cantidadInput.value) || 0;
            if (cantidadQuitar > 0) {
                quitarProducto(index, cantidadQuitar, productos);
                cantidadInput.value = '';
            }
        } else if (event.target.classList.contains('boton-eliminar')) {
            const index = event.target.getAttribute('data-index');
            eliminarProducto(index, productos);
        }
    });
});

// inicializa la aplicación cargando productos desde el JSON o localStorage
obtenerProductos().then(productos => {
    mostrarProductos(productos);
});
