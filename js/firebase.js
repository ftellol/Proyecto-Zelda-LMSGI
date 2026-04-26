import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, where, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey:            "AIzaSyBH25YAbp2_rSWzqfzqAyyvql8OqMfnhHU",
    authDomain:        "hyrule-encyclopedia.firebaseapp.com",
    projectId:         "hyrule-encyclopedia",
    storageBucket:     "hyrule-encyclopedia.firebasestorage.app",
    messagingSenderId: "236016733248",
    appId:             "1:236016733248:web:0d26b5a8094044f85ae3a5"
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

const coleccion = "favoritos";

/* Obtener todos los favoritos */
export async function obtenerFavoritos() {
    const resultado = await getDocs(collection(db, coleccion));
    return resultado.docs.map(documento => ({
        docId: documento.id,
        ...documento.data()
    }));
}

/* Añadir un favorito */
export async function añadirFavorito(entidad, tipo) {
    const docRef = await addDoc(collection(db, coleccion), {
        entidadId:    entidad.id,
        nombre:       entidad.name        ?? "Sin nombre",
        descripcion:  entidad.description ?? "",
        tipo:         tipo,
        fechaAdicion: serverTimestamp()
    });
    return docRef.id;
}

/* Eliminar un favorito*/
export async function eliminarFavorito(docId) {
    await deleteDoc(doc(db, coleccion, docId));
}

/* Vaciar todos los favoritos */
export async function vaciarFavoritos() {
    const resultado = await getDocs(collection(db, coleccion));
    const eliminaciones = resultado.docs.map(documento =>
        deleteDoc(doc(db, coleccion, documento.id))
    );
    await Promise.all(eliminaciones);
}

/* Comprobar si alguno ya está en favoritos */
export async function comprobarFavorito(entidadId) {
    const consulta = query(collection(db, coleccion), where("entidadId", "==", entidadId));
    const resultado = await getDocs(consulta);
    if (resultado.empty) return null;
    return resultado.docs[0].id;
}