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
        </section>
    </article>
`;
}
