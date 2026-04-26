import { mostrarEstado } from "./ui.js";

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
    const todos = json.data ?? [];

    const filtrados = todos.filter(entidad =>
        entidad.name?.toLowerCase().includes(termino.toLowerCase())
    );

    guardarEnCache(clave, filtrados);
    console.info(`[API] "${termino}" (${tipo}): ${filtrados.length} resultados cacheados.`);

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