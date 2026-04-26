export function mostrarEstado(mensaje, tipo = "") {
    const estado = document.getElementById("estado-busqueda");
    if (!estado) return;
    estado.textContent = mensaje;
    estado.className   = `estado ${tipo}`.trim();
}