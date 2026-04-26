import { añadirFavorito, eliminarFavorito, vaciarFavoritos, obtenerFavoritos, comprobarFavorito } from "./firebase.js";

export function mostrarEstado(mensaje, tipo = "") {
    const estado = document.getElementById("estado-busqueda");
    if (!estado) return;
    estado.textContent = mensaje;
    estado.className   = `estado ${tipo}`.trim();
}

export function renderizarResultados(resultados, tipo = "") {
    const contenedor = document.getElementById("resultados");
    if (!contenedor) return;

    if (!resultados.length) {
        contenedor.innerHTML = "";
        return;
    }

    contenedor.innerHTML = resultados.map(entidad => crearTarjeta(entidad, tipo)).join("");

    /* Asignar eventos a los botones de favorito */
    contenedor.querySelectorAll(".btn-favorito").forEach(btn => {
        btn.addEventListener("click", async () => {
            const entidadId = btn.dataset.id;
            const entidad   = resultados.find(r => r.id === entidadId);
            if (!entidad) return;

            btn.disabled    = true;
            btn.textContent = "...";

            try {
                const docId = await comprobarFavorito(entidadId);
                if (docId) {
                    await eliminarFavorito(docId);
                    btn.textContent = "Guardar";
                    btn.classList.remove("guardado");
                } else {
                    await añadirFavorito(entidad, tipo);
                    btn.textContent = "Guardado";
                    btn.classList.add("guardado");
                }
            } catch (error) {
                btn.textContent = "Error";
                console.error(error);
            } finally {
                btn.disabled = false;
            }
        });
    });

    marcarFavoritosExistentes(contenedor, resultados);
}

async function marcarFavoritosExistentes(contenedor, resultados) {
    for (const entidad of resultados) {
        const docId = await comprobarFavorito(entidad.id).catch(() => null);
        if (docId) {
            const btn = contenedor.querySelector(`.btn-favorito[data-id="${entidad.id}"]`);
            if (btn) {
                btn.textContent = "Guardado";
                btn.classList.add("guardado");
            }
        }
    }
}

function crearTarjeta(entidad, tipo) {
    const nombre      = entidad.name        ?? "Sin nombre";
    const descripcion = entidad.description ?? "Sin descripción disponible.";
    const apariciones = entidad.appearances?.length ?? 0;

    /* Campos extra según el tipo */
    let extras = "";

    if (tipo === "characters") {
        if (entidad.race)   extras += `<p class="tarjeta-extra">Raza: ${entidad.race}</p>`;
        if (entidad.gender) extras += `<p class="tarjeta-extra">Género: ${entidad.gender}</p>`;
    }

    if (tipo === "bosses" && entidad.dungeons?.length) {
        extras += `<p class="tarjeta-extra">Dungeons: ${entidad.dungeons.length}</p>`;
    }

    if (tipo === "places" && entidad.inhabitants?.length) {
        extras += `<p class="tarjeta-extra">Habitantes: ${entidad.inhabitants.length}</p>`;
    }

    if (apariciones > 0) {
        extras += `<p class="tarjeta-extra">Aparece en ${apariciones} juego(s)</p>`;
    }

    const etiquetas = {
        characters: "Personaje",
        monsters:   "Monstruo",
        bosses:     "Jefe",
        places:     "Lugar"
    };
    const etiqueta = etiquetas[tipo] ?? tipo;

    return `
        <article class="tarjeta">
            <header class="tarjeta-imagen-placeholder"></header>
            <section class="tarjeta-contenido">
                <span class="tarjeta-tipo">${etiqueta}</span>
                <h3 class="tarjeta-nombre">${nombre}</h3>
                <p class="tarjeta-descripcion">${descripcion}</p> ${extras}
                <button class="btn-favorito" data-id="${entidad.id}">Guardar</button>
            </section>
        </article>
    `;
}

let todosLosFavoritos = [];

/* Cargado de favoritos desde Firebase */
async function iniciarPaginaFavoritos() {
    const lista = document.getElementById("lista-favoritos");
    if (!lista) return;

    lista.innerHTML = "<p>Cargando favoritos...</p>";

    try {
        todosLosFavoritos = await obtenerFavoritos();
        aplicarFiltrosYOrden();
    } catch (error) {
        lista.innerHTML = `<p class="error-favoritos">Error al cargar favoritos: ${error.message}</p>`;
    }
}

function aplicarFiltrosYOrden() {
    const filtro = document.getElementById("filtro-tipo")?.value    ?? "todos";
    const orden  = document.getElementById("orden-favoritos")?.value ?? "fecha-desc";

    let lista = [...todosLosFavoritos];

    /* Filtrar por tipo */
    if (filtro !== "todos") {
        lista = lista.filter(favorito => favorito.tipo === filtro);
    }

    /* Ordenar */
    lista.sort((a, b) => {
        switch (orden) {
            case "nombre-asc":  return (a.nombre ?? "").localeCompare(b.nombre ?? "");
            case "nombre-desc": return (b.nombre ?? "").localeCompare(a.nombre ?? "");
            case "fecha-asc":   return (a.fechaAdicion?.seconds ?? 0) - (b.fechaAdicion?.seconds ?? 0);
            case "fecha-desc":
            default:            return (b.fechaAdicion?.seconds ?? 0) - (a.fechaAdicion?.seconds ?? 0);
        }
    });

    renderizarFavoritos(lista);
}

function renderizarFavoritos(favoritos) {
    const lista = document.getElementById("lista-favoritos");
    if (!lista) return;

    if (!favoritos.length) {
        lista.innerHTML = "<p>No hay favoritos guardados todavia.</p>";
        return;
    }

    lista.innerHTML = favoritos.map(favorito => `
        <article class="tarjeta">
            <header class="tarjeta-imagen-placeholder"></header>
            <section class="tarjeta-contenido">
                <span class="tarjeta-tipo">${favorito.tipo}</span>
                <h3 class="tarjeta-nombre">${favorito.nombre}</h3>
                <p class="tarjeta-descripcion">${favorito.descripcion}</p>
                <button class="btn-eliminar" data-doc-id="${favorito.docId}">Eliminar</button>
            </section>
        </article>
    `).join("");

    /* Eliminar cada tarjeta */
    lista.querySelectorAll(".btn-eliminar").forEach(btn => {
        btn.addEventListener("click", async () => {
            btn.disabled = true;
            btn.textContent = "...";

            try {
                await eliminarFavorito(btn.dataset.docId);
                todosLosFavoritos = todosLosFavoritos.filter(f => f.docId !== btn.dataset.docId);
                aplicarFiltrosYOrden();
            } catch (error) {
                btn.textContent = "Error";
                btn.disabled = false;
                console.error(error);
            }
        });
    });
}

/* Filtro y orden */
document.getElementById("filtro-tipo")?.addEventListener("change", aplicarFiltrosYOrden);
document.getElementById("orden-favoritos")?.addEventListener("change", aplicarFiltrosYOrden);

/* Vaciar todos los favoritos */
document.getElementById("btn-vaciar")?.addEventListener("click", async () => {
    const btn = document.getElementById("btn-vaciar");
    btn.disabled    = true;
    btn.textContent = "Vaciando...";

    try {
        await vaciarFavoritos();
        todosLosFavoritos = [];
        aplicarFiltrosYOrden();
    } catch (error) {
        console.error(error);
    } finally {
        btn.disabled    = false;
        btn.textContent = "Vaciar lista";
    }
});

iniciarPaginaFavoritos();