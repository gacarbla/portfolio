const myIndexedDB = {
    db: undefined,
    startDB() {
        return new Promise(async resolve => {
            let request = window.indexedDB.open("user", 1);
            request.onerror = function () {
                console.error("No se pudo abrir la base de datos");
            };
            request.onsuccess = function () {
                console.info("Base de datos abierta con éxito");
                myIndexedDB.db = request.result;
                resolve()
            };
            request.onupgradeneeded = function (e) {
                myIndexedDB.db = e.target.result;
                myIndexedDB.addsheet("guilds", [
                    { name: "name", unique: false },
                    { name: "icon", unique: false },
                    { name: "owner", unique: false },
                    { name: "permissions", unique: false },
                    { name: "features", unique: false }
                ])
                myIndexedDB.addsheet("data", [
                    { name: "value", unique: false }
                ])
            };
        })
    },
    addsheet(name, fields) {
        let objectStore = myIndexedDB.db.createObjectStore(name, {
            keyPath: "id",
            autoIncrement: false,
        });
        fields.forEach(field => {
            objectStore.createIndex(field.name, field.name, { unique: field.unique });
        });
        console.info("Configuración de la base de datos completa");
    },
    addElement(sheet, element) {
        let transaction = myIndexedDB.db.transaction([sheet], "readwrite");
        let objectStore = transaction.objectStore(sheet);
        let request = objectStore.add(element);
        transaction.onerror = function () { console.error("Transacción fallida"); };
    },
    displayData(sheet) {
        return new Promise(function (resolve, reject) {
            try {
                let toShow = []
                let objectStore = myIndexedDB.db.transaction(sheet).objectStore(sheet);
                objectStore.openCursor().onsuccess = function (e) {
                    let cursor = e.target.result;
                    if (cursor) {
                        toShow.push(cursor.value)
                        cursor.continue();
                    }
                };
                resolve(toShow)
            } catch (err) {
                reject(err)
            }
        })
    },
    deleteItem(sheet, id) {
        let transaction = myIndexedDB.db.transaction([sheet], "readwrite");
        let objectStore = transaction.objectStore(sheet);
        try {
            let request = objectStore.delete(id);
        } catch (err) {
            console.error(err)
        }
        transaction.onerror = function () { console.error("Transacción fallida") }
    },
    async has(sheet, id) {
        return new Promise(async resolve => {
            const list = await myIndexedDB.displayData(sheet)
            await sleep(500)
            var i = 0
            for (i = 0; i < list.length; i++) {
                if (list[i].id == id) {
                    resolve(true)
                }
            }
            resolve(false)
        })
    },
    async listLength(sheet, min, max) {
        return new Promise(async function (resolve, reject) {
            if (!sheet) return console.error("Tabla no especificada")
            const list = await myIndexedDB.displayData(sheet)
            await sleep(500)
            if (!min && !max) {
                resolve(list.length)
            } else if (min > 0 && max >= 0 && list.length >= min && list.length <= max) {
                resolve(true)
            } else if (min >= 0 && list.length >= min && !max) {
                resolve(true)
            } else if (max >= 0 && list.length <= max && !min) {
                resolve(true)
            } else {
                resolve(false)
            }
        })
    },
    async reset(sheet) {
        const list = await myIndexedDB.displayData(sheet)
        await sleep(500)
        var i = 0
        for (i = 0; i < list.length; i++) {
            myIndexedDB.deleteItem(sheet, list[i].id)
        }
    }
}