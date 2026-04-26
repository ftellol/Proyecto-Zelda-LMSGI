async function cargarXML() {
    const respuesta = await fetch("data/juegos.xml");
    if (!respuesta.ok) throw new Error(`No se pudo cargar juegos.xml (${respuesta.status})`);
    const texto = await respuesta.text();
    const xml = new DOMParser().parseFromString(texto, "application/xml");
    if (xml.querySelector("parsererror")) throw new Error("XML inválido");
    return xml;
}

/* XML a JSON */
function xmlAJson(xml) {
    return Array.from(xml.querySelectorAll("juego")).map(nodo => ({
        id:             nodo.getAttribute("id"),
        titulo:         nodo.querySelector("titulo")?.textContent || "",
        desarrolladora: nodo.querySelector("desarrolladora")?.textContent || "",
        plataforma:     nodo.querySelector("plataforma")?.textContent || "",
        anio:           Number(nodo.querySelector("anio")?.textContent),
        puntuacion:     Number(nodo.querySelector("puntuacion")?.textContent)
    }));
}

/* JSON a CSV y Descarga */
function exportarCSV(juegos) {
    const cabeceras = ["id", "titulo", "desarrolladora", "plataforma", "anio", "puntuacion"];
    const filas = juegos.map(j => cabeceras.map(c => `"${j[c]}"`).join(",")); // Comillas en todo para simplificar

    const contenido = [cabeceras.join(","), ...filas].join("\n");
    const blob = new Blob([contenido], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "catalogo_zelda.csv";
    link.click();
    URL.revokeObjectURL(url);
}

function renderizarTabla(juegos) {
    const tbody = document.getElementById("tbody-juegos");
    if (!tbody) return;

    tbody.innerHTML = juegos.map(juego => `
    <tr>
        <td data-label="ID">${juego.id}</td>
        <td data-label="Título" class="titulo-juego">${juego.titulo}</td>
        <td data-label="Desarrolladora">${juego.desarrolladora}</td>
        <td data-label="Plataforma">${juego.plataforma}</td>
        <td data-label="Año">${juego.anio}</td>
        <td data-label="Puntuación" class="puntuacion">${juego.puntuacion}</td>
    </tr>
`).join("");
}

/* Inicialización */
let catalogoJson = [];

(async function iniciar() {
    try {
        const xml = await cargarXML();
        catalogoJson = xmlAJson(xml);
        renderizarTabla(catalogoJson);
    } catch (e) {
        const tbody = document.getElementById("tbody-juegos");
        if (tbody) tbody.innerHTML = `<tr><td colspan="6" class="error-tabla">${e.message}</td></tr>`;
    }
})();

document.getElementById("btn-exportar-csv")?.addEventListener("click", () => {
    if (catalogoJson.length) exportarCSV(catalogoJson);
});