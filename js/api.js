const apiUrl = "https://zelda.fanapis.com/api";

/* Caché en localStorage */
function generarClave(tipo, termino) {
    return `zelda_${tipo}_${termino.trim().toLowerCase()}`;
}

function guardarEnCache(clave, datos) {
    try {
        localStorage.setItem(clave, JSON.stringify(datos));
    } catch (error) {
        console.warn("localStorage lleno, no se pudo cachear:", error.message);
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
