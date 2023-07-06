const data = {
    eliminar(ruta) {
        localStorage.removeItem(`${ruta}`);
        return localStorage
    },
    establecer(ruta, valor) {
        localStorage.setItem(`${ruta}`, valor);
        return
    },
    existe(ruta) {
        if (localStorage[`${ruta}`]) return true;
        return false;
    },
    obtener(ruta) {
        return localStorage.getItem(`${ruta}`);
    },
    reset() {
        localStorage.clear();
    },
    table() {
        return console.table(localStorage)
    }
}