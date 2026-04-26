import { renderizarResultados, mostrarEstado } from "./ui.js";

const apiUrl = "https://zelda.fanapis.com/api";

/* Caché en localStorage */
function generarClave(tipo, termino) {
    return `zelda_${tipo}_${termino.trim().toLowerCase()}`;
}

function guardarEnCache(clave, datos) {
    try {
        localStorage.setItem(clave, JSON.stringify(datos));
    } catch (error) {
        mostrarEstado("error", "El almacenamiento local está lleno. La caché no funcionará.");
    }
}

function leerDeCache(clave) {
    const valor = localStorage.getItem(clave);
    if (!valor) return null;
    try {
        return JSON.parse(valor);
    } catch {
        return null;
    }
}

export async function buscarEntidades(tipo, termino) {
    const clave = generarClave(tipo, termino);

    const cache = leerDeCache(clave);
    if (cache !== null) {
        return cache;
    }

    const url = `${apiUrl}/${tipo}?limit=50&page=0`;
    const respuesta = await fetch(url);

    if (!respuesta.ok) {
        throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`);
    }

    const json = await respuesta.json();
    const datos = json.data ?? [];
    const filtrados = datos.filter(entidad =>
        entidad.name?.toLowerCase().includes(termino.toLowerCase())
    );

    guardarEnCache(clave, filtrados);

    return filtrados;
}

/* Debounce */
export function debounce(funcion, espera = 400) {
    let temporizador;
    return function (...args) {
        clearTimeout(temporizador);
        temporizador = setTimeout(() => funcion.apply(this, args), espera);
    };
}

/* Lógica del buscador: Eventos y control de la pantalla */
const inputBusqueda = document.getElementById("busqueda");
const selectorTipo  = document.getElementById("tipo");

if (inputBusqueda && selectorTipo) {
    const lanzarBusqueda = debounce(async () => {
        const termino = inputBusqueda.value.trim();
        const tipo    = selectorTipo.value;

        if (!termino) {
            renderizarResultados([]);
            mostrarEstado("");
            return;
        }

        mostrarEstado("Buscando...", "cargando");

        try {
            const resultados = await buscarEntidades(tipo, termino);
            renderizarResultados(resultados, tipo);

            if (resultados.length === 0) {
                mostrarEstado(`No se encontraron resultados para "${termino}".`, "vacio");
            } else {
                mostrarEstado("");
            }
        } catch (error) {
            mostrarEstado(`Error al conectar con la API: ${error.message}`, "error");
            renderizarResultados([]);
        }
    }, 400);

    inputBusqueda.addEventListener("input", lanzarBusqueda);

    selectorTipo.addEventListener("change", () => {
        if (inputBusqueda.value.trim()) lanzarBusqueda();
    });
}
