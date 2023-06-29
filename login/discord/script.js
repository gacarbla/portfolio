var log
var loggeduser

function addText(text, style) {
  document.getElementById("logs").innerHTML = `<p${style ? ` class="${style}"}` : ""}>${text}</p>`
}

class user {
  constructor(data, guilds) {
    this.data = data
    this.guilds = guilds
    addText("Usuario construído exitosamente", "success")
  }
  save() {
    addText("Comprobando bases de datos")
    if (myIndexedDB.has("data", `${this.data.id}`)) {
      myIndexedDB.deleteItem("data", `${this.data.id}`)
    }
    addText("Bases de datos comprobadas", "success")
    addText("Añadiendo información")
    myIndexedDB.addElement("data", {
      id: this.data.id,
      token: this.data.token,
      expiration: this.data.expiration,
      avatar: this.data.avatar,
      username: this.data.username,
      discriminator: this.data.discriminator,
      mail: this.data.mail
    })
    addText("Información añadida exitosamente", "success")
    addText("Añadiendo servidores")
    this.guilds.forEach(async guild => {
      if (await myIndexedDB.has("guilds", guild.id)) {
        myIndexedDB.deleteItem("guilds", guild.id)
      }
      myIndexedDB.addElement("guilds", {
        id: guild.id,
        name: guild.name,
        icon: guild.icon,
        owner: guild.owner,
        permissions: guild.permissions,
        features: typeof guild.features == Array ? guild.features.join(" ") : guild.features
      })
    })
    addText("Servidores añadidos exitosamente", "sucess")
  }
  async logOut() {
    addText("Cerrando sesión...")
    myIndexedDB.reset("data")
    myIndexedDB.reset("guilds")
    addText("Sesión cerrada", "success")
    await sleep(2500)
    window.location = window.location.href.split("#")[0]
  }
  loadUser() {
    try {
      addText("Nombre de usuario recuperado")
      addText(`¡Hola ${this.data.username}${this.data.discriminator == 0 ? "" : `#${this.data.discriminator}`}`)
      addText("Foto de perfil recuperada")
    } catch {
      addText("Ha sido imposible recuperar el usuario", "error")
    }
  }
}

class login {
  constructor() {
    this.token = "";
    this.expiration = "";
    this.username = "";
    this.discriminator = "";
    this.id = "";
    this.avatar = "";
    this.mail = "";
    this.guilds = [];
  }
  async fetch() {
    try {
      addText("Iniciando recuperación del token")
      const fragment = new URLSearchParams(window.location.hash.slice(1));
      const token = fragment.get('token_type') ? `${fragment.get('token_type')} ${fragment.get('access_token')}` : data.obtener("user_token");
      addText("Token recuperado")
      console.info("Iniciando conexión con la API de Discord")
      addText("Iniciando conexión con la API de Discord")
      await fetch('https://discord.com/api/users/@me', {
        headers: {
          authorization: token,
        },
      }).then(result => result.json())
        .then(async response => {
          addText("Convirtiendo datos a objeto")
          console.info("Conexión con la API de Discord exitosa")
          this.token = token;
          addText("Conexión a la API de Discord exitosa", "success")
          console.info("Obteniendo servidores")
          addText("Obteniendo servidores")
          await fetch('https://discord.com/api/users/@me/guilds', {
            headers: {
              authorization: token,
            },
          }).then(guilds => guilds.json())
            .then(guilds => {
              console.info("Servidores obtenidos")
              addText("Servidores obtenidos extitosamente", "success")
              console.info("Guardando datos")
              addText("Guardando datos")
              this.expiration = fragment.get('expires_in') || data.obtener("user_expiration");
              this.username = response.username;
              this.discriminator = response.discriminator;
              this.id = response.id;
              this.avatar = response.avatar;
              this.mail = response.email;
              this.guilds = guilds;
              console.info("Servidores guardados")
              addText("Datos guardados exitosamente")
            }).catch(console.error);
        }).catch(console.error);

    } catch (err) {
      addText("No ha sido posible conectarse a la API de Discord", "error")
      console.error(err)
    }
  }
  load(data, guilds) {
    console.info("Reconstruyendo información")
    addText("Reconstruyendo información")
    try {
      this.token = data.token;
      this.expiration = data.expiration;
      this.username = data.username;
      this.discriminator = data.discriminator;
      this.id = data.id;
      this.avatar = data.avatar;
      this.mail = data.mail;
      this.guilds = guilds;
      console.info("Información reconstruída")
      addText("Información reconstruída", "success")
    } catch (err) {
      console.error(err)
      console.warn("No ha sido posible reconstruír la información")
      addText("No ha sido posible reconstruír la información", "error")
    }
  }
  buildUser() {
    addText("Construyendo usuario...")
    return new user({
      token: this.token,
      expiration: Date.now() + parseInt(this.expiration) - 100,
      id: this.id,
      username: this.username,
      discriminator: this.discriminator,
      avatar: this.avatar,
      mail: this.mail
    }, this.guilds)
  }
}

window.onload = async function () {

  const fragment = new URLSearchParams(window.location.hash.slice(1));
  if (!fragment.get('access_token') && !fragment.get('logout')) {
    addText("Redirigiendo a Discord")
    await sleep(1500)
    window.location = 'https://discord.com/api/oauth2/authorize?client_id=1122989140594655282&redirect_uri=https%3A%2F%2Fgacarblaportfolio.netlify.app%2Flogin%2Fdiscord%2F&response_type=token&scope=guilds%20identify%20email'
  } else {
    try {
      await myIndexedDB.startDB("user")
    } catch (err) {
      addText("La base de datos ha fallado y no ha sido posible conectarse a tu cuenta", "error")
      destroyLoader()
      console.error(err)
      return console.warn("Error en la base de datos")
    }
  
    log = new login()
  
    list_length = await myIndexedDB.listLength("data", 1)
    if (list_length) {
      let data_log = await myIndexedDB.displayData("data")
      let guilds_log = await myIndexedDB.displayData("guilds")
      await sleep(500)
      log.load(data_log[0], guilds_log)
    }
  
    if (log.token == undefined || log.token == "") {
      await log.fetch()
    }
  
    loggeduser = log.buildUser()
  
    if (loggeduser != undefined && loggeduser.data.expiration > Date.now()) {
      loggeduser.loadUser()
      loggeduser.save()
      if (fragment.get('logout') == "true") {
        loggeduser.logOut()
        addText("¡Se ha cerrado sesión correctamente!", "success")
      } else {
        addText("¡Se ha iniciado sesión correctamente!", "success")
      }
    } else {
      if (fragment.get('logout') == "true") {
        loggeduser.logOut()
        addText("No se logró cerrar sesión", "error")
      } else {
        addText("No se logró iniciar sesión", "error")
      }
    }
    await sleep(1500)
    window.location = '../../'
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
