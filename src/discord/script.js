class user {
  constructor(data, guilds) {
    this.data = data
    this.guilds = guilds
  }
  save() {
    if (myIndexedDB.has("data", `${this.data.id}`)) {
      myIndexedDB.deleteItem("data", `${this.data.id}`)
    }
    myIndexedDB.addElement("data", {
      id: this.data.id,
      token: this.data.token,
      expiration: this.data.expiration,
      avatar: this.data.avatar,
      username: this.data.username,
      discriminator: this.data.discriminator,
      mail: this.data.mail
    })
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
  }
  async logOut() {
    myIndexedDB.reset("data")
    myIndexedDB.reset("guilds")
    await sleep(2500)
    window.location = window.location.href.split("#")[0]
  }
  loadUser() {
    try {
      document.querySelector(".profile > button.specific").style.visibility = "visible"
      document.querySelector(".profile > button.default").style.visibility = "hidden"
      document.getElementById("user_username").innerHTML = this.data.username
      document.getElementById("user_discriminator").innerHTML = `${this.data.discriminator == 0 ? "" : `#${this.data.discriminator}`}`
      document.getElementById("user_img").src = `https://cdn.discordapp.com/avatars/${this.data.id}/${this.data.avatar}.jpg`;
    } catch {
      console.warn("No ha sido posible obtener el usuario")
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
      const fragment = new URLSearchParams(window.location.hash.slice(1));
      const token = fragment.get('token_type') ? `${fragment.get('token_type')} ${fragment.get('access_token')}` : data.obtener("user_token");

      if (!token || token == " ") {
        return
      }

      console.info("Iniciando conexión con la API de Discord")

      await fetch('https://discord.com/api/users/@me', {
        headers: {
          authorization: token,
        },
      }).then(result => result.json())
        .then(async response => {
          console.log(response)
          console.info("Conexión con la API de Discord exitosa")
          this.token = token;
          console.info("Obteniendo servidores")
          await fetch('https://discord.com/api/users/@me/guilds', {
            headers: {
              authorization: token,
            },
          }).then(guilds => guilds.json())
            .then(guilds => {
              console.info("Servidores obtenidos")
              console.info("Guardando servidores")
              this.expiration = fragment.get('expires_in') || data.obtener("user_expiration");
              this.username = response.username;
              this.discriminator = response.discriminator;
              this.id = response.id;
              this.avatar = response.avatar;
              this.mail = response.email;
              this.guilds = guilds;
              console.info("Servidores guardados")
            }).catch(console.error);
        }).catch(console.error);

    } catch (err) {
      console.warn("No ha sido posible conectarse a la API de Discord")
      console.error(err)
    }
  }
  load(data, guilds) {
    console.info("Reconstruyendo información")
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
    } catch (err) {
      console.error(err)
      console.warn("No ha sido posible reconstruír la información")
    }
  }
  buildUser() {
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