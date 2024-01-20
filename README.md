<center>

# Express

</center>

***Juan Dimas Abrante Hernández***
***Curso:*** 2º de Ciclo Superior de Desarrollo de Aplicaciones Web.

### ÍNDICE

+ [Introducción](#id1)
+ [Objetivos](#id2)
+ [Material empleado](#id3)
+ [Desarrollo](#id4)
+ [Conclusiones](#id5)


#### ***Introducción***. <a name="id1"></a>

En esta práctica abordaremos el concepto de "despliegue" de una aplicación web con el framework para Node.js, Express junto con el servidor web Nginx.
Para entender mejor el flujo de trabajo real de un proyecto esto se realizará tanto en un servidor de desarrollo, como en otro de despliegue.

#### ***Objetivos***. <a name="id2"></a>

El objetivo principal de esta práctica será llegar a desplegar en producción aplicación web simple, que conste de una base de datos que proporcione información acerca de destinos que hemos visitados y que queremos visitar.

#### ***Material empleado***. <a name="id3"></a>

Para la realización de esta práctica se ha utilizado una máquina virtual con un sistema operativo Debian 12 ( la cual servirá de servidor de desarrollo ), y una VPS con un sistema operativo también Debian 12

#### ***Desarrollo***. <a name="id4"></a>

##### Instalación de Node.js

El primer paso será instalar Node.js, un entorno de ejecución que nos permitirá utilizar JavaScript fuera de la web, en nuestro caso, en la parte de servidor.

Para ello utilizaremos el siguiente comando, el cual descargará un instalador que facilitará el proceso de añadir los repositorios oficiales de Node.js: 

```
curl -fsSL https://deb.nodesource.com/setup_current.x | sudo -E bash
```

Hecho esto, procederemos a instalar Node.js

```
sudo apt install -y nodejs
```

Comprobamos la versión instalada tanto de Node.js como del sistema gestor de paquetes npm:

```
pc17-dpl@a109pc17dpl:~$ node --version
v21.5.0

pc17-dpl@a109pc17dpl:~$ npm --version
10.2.4
```

Instalado tanto Node.js como npm, el siguiente paso será crear la estructura de nuestro proyecto. Para ello deberemos de instalar express-generator, el cual habrá que instalar por medior de npm de la siguiente manera:

```
sudo npm install -g express-generator
```

El siguiente paso será crear la propia estructura del proyecto. En esto caso indicaremos que las plantillas utilizarán el motor "pug":

```
pc17-dpl@a109pc17dpl:~$ express --view=pug travelroad_express

   create : travelroad_express/
   create : travelroad_express/public/
   create : travelroad_express/public/javascripts/
   create : travelroad_express/public/images/
   create : travelroad_express/public/stylesheets/
   create : travelroad_express/public/stylesheets/style.css
   create : travelroad_express/routes/
   create : travelroad_express/routes/index.js
   create : travelroad_express/routes/users.js
   create : travelroad_express/views/
   create : travelroad_express/views/error.pug
   create : travelroad_express/views/index.pug
   create : travelroad_express/views/layout.pug
   create : travelroad_express/app.js
   create : travelroad_express/package.json
   create : travelroad_express/bin/
   create : travelroad_express/bin/www

   change directory:
     $ cd travelroad_express

   install dependencies:
     $ npm install

   run the app:
     $ DEBUG=travelroad-express:* npm start
```

A continuación nos situaremos en la carpeta del proyecto e instalaremos las pedencias.

```
npm install
```

Y probamos la aplicación con el siguiente comando ( podremos acceder por a través del puerto 3000 ): 

```
pc17-dpl@a109pc17dpl:~/travelroad_express$ DEBUG=travelroad:* npm start

> travelroad-express@0.0.0 start
> node ./bin/www
```

<center>


![imagen1](img/1.png)

</center>

##### Configuración de la base de datos

Para esta práctica utilizaremos la misma base de datos utilizada en prácticas anteriores, es decir PostgreSQL. Para ver la configuración de la misma puede verlo <a href='https://github.com/jdabrante/travelroad_laravel#postrgresql'>aqui</a>.

Dicho esto, para poder acceder a la base de datos a través de nuestra aplicación en Express necesitamos instalar node-postgres:

```
pc17-dpl@a109pc17dpl:~/travelroad_express$ npm install pg

added 16 packages, and audited 146 packages in 4s

12 packages are looking for funding
  run `npm fund` for details

7 vulnerabilities (2 low, 5 high)

To address issues that do not require attention, run:
  npm audit fix

To address all issues, run:
  npm audit fix --force

Run `npm audit` for details.
```

Un paso adicional y opcional, pero sin lugar a dudas una buena práctica, es mantener las credenciales fuera del controlador de versiones. Para ello utilizaremos un fichero .env que se deberá de incluir en el .gitignore de nuestro repositorio. Además, para poder utilizarlo dentro de nuestro proyecto, será necesario, en este caso, instalar el paquete dotenv:

```
pc17-dpl@a109pc17dpl:~/travelroad_express$ npm install dotenv

added 1 package, and audited 147 packages in 2s

13 packages are looking for funding
  run `npm fund` for details

7 vulnerabilities (2 low, 5 high)

To address issues that do not require attention, run:
  npm audit fix

To address all issues, run:
  npm audit fix --force

Run `npm audit` for details.
```

Ahora, dentro de nuestro proyecto crearemos el fichero .env e incluiremos dentro de este la cadena de conexión a la base de datos PostgrreSQL:

```
~/travelroad_express$ echo 'PSQL_CONNECTION=postgresql://travelroad_user:XXXXXX@localhost:5432/travelroad' > .env
```

##### Lógica de negocio

Para realizar la conexión a la base de datos de PostgreSQL deberemos de crear el fichero de configuración correspondiente:

```
~/travelroad_express$ mkdir config && vi config/database.js
```
```
const { Pool } = require("pg");
require("dotenv").config();
const connectionString = process.env.PSQL_CONNECTION;
const pool = new Pool({
  connectionString,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
```

Una vez creado el fichero de configuración para la base de datos configuramos las rutas:

```
const db = require("../config/database");
let express = require("express");
let router = express.Router();

/* GET home page. */
router.get("/", async function (req, res, next) {
  const { rows: wished } = await db.query(
    "SELECT * FROM places WHERE visited=false"
  );
  const { rows: visited } = await db.query(
    "SELECT * FROM places WHERE visited=true"
  );
  res.render("index", { wished, visited });
});

module.exports = router;
```

Y por último las plantillas: 

```
~/travelroad_express$ vi views/index.pug
```
```
block content
  h1= "My Travel Bucket List"
  h2= "Places I'd Like to Visit"
  ul
    each place in wished
      li= place.name
  h2= "Places I've Already Been To"
  ul
    each place in visited
      li= place.name
```

##### Gestion de procesos

Para la gestión de procesos se utilizará pm2 para aplicaciones Node.js en producción:

```
sudo npm install -g pm2
```

Para lanzar un proceso en background con nuestra aplicación: 

```
pm2 start ./bin/www --name travelroad
```

##### Configuración Nginx

Para la configuración de nginx:

```
server {
    server_name travelroad_express;

    location / {
        proxy_pass http://localhost:3000;  # socket TCP
    }
}
```

##### Script de despliegue

Creamos el fichero del script que irá dentro del propio proyecto:

```
nano deploy.sh
```

Y le damos los permisos correspondientes:

```
chmod +x deploy.sh
```

Para hacer el despliegue en producción bastará con tener el repositorio disponible en el mismo y ejecutar el fichero que contendrá el siguiente script:

```
#!/bin/bash

ssh arkania "
  cd $(dirname $0)
  git pull
  npm install
  pm2 restart travelroad --update-env
"
```

#### Modificación del proyecto

A continuación se realizarán las modificaciones en el proyecto para que muestre en diferentes rutas los sitios visitados y aquellos que se quieren visitar.

Para la modificación, en primer lugar ha sido necesario configurar el fichero que gestiona las rutas, añadiendo dos nuevas, "/visited" y "/wished". Además de definir las variables que le serán pasadas a las mismas para poder renderizar 
las vistas correspondientes:

```
const db = require("../config/database");
let express = require("express");
let router = express.Router();

/* GET home page. */
router.get("/", async function (req, res, next) {
  const { rows: wished } = await db.query(
    "SELECT * FROM places WHERE visited=false"
  );
  const { rows: visited } = await db.query(
    "SELECT * FROM places WHERE visited=true"
  );
  res.render("index", { wished, visited });
});

router.get("/wished", async function (req, res, next) {
    const {rows:wished} = await db.query(
      "SELECT * FROM places WHERE visited=false"
);
   res.render("wished", {wished});
});

router.get("/visited", async function (req, res, next) {
    const {rows:visited} = await db.query(
      "SELECT * FROM places WHERE visited=true"
);
   res.render("visited", {visited});
});

module.exports = router;
```

Una vez configuradas las rutas, ya solo queda gestionar las vistas. Para ello se han creado do nuevos ficheros dentro del directirio de views:

- Visited:

```
block content
	h1= "My Travel Bucket List"
	h2= "Places I've Already Been To"
	ul
		each place in visited
			li= place.name
	p
		a(href='/') Go Back
```

- Wished:

```
block content
	h1= "My Travel Bucket List"
	h2= "Places I'd Like to Visit"
	ul
		each place in wished
			li= place.name
	p
		a(href='/') Go Back
```

Y se ha modificado el index para poder acceder a estas dos nuevas rutas:

```
block content
  h1= "My Travel Bucket List"
  p
    a(href='/visited') Places I'd Like to Visit
  p 
    a(href='/wished') Places I've Already Been To

  p!= "&#x1f4ab; Powered by Express"
```
<br>

<center>

![image1](1e.png)

<br>

![image2](2e.png)

<br>

![image3](3e.png)

</center>


#### ***Conclusiones***. <a name="id5"></a>

En esta parte debemos exponer las conclusiones que sacamos del desarrollo de la prácica.
