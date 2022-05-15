# Inquinapi

Inquinapi is a web service that provides data about pollution of almost every state. It can send pollution data starting
from 1860 to 2020 The data are stored in a database in MongoDB. The connection string to establish connection with DB
isn't included. This web service is built following the RESTful API principles architecture. The API is used to send
data to [pollutinator](https://github.com/IMBeniamin/pollutinator). This API is hosted on docker. You can use this web
service through this link: https://inquinapi.derpi.it/api/. If you want to read the documentation about the API, click
this [link]("https://www.derpi.it/inquinapi/docs")

## Getting started

<ins>1. Clone the repository </ins>

To clone the repository, you have to install [git](), a version control system. After downloading and install it, open
your terminal and run the command ``git clone https://github.com/IMBeniamin/inquinapi.git``. Please be sure to be in the
path where you want to clone the repo.

<ins>2. Installing dependencies</ins>

Before you run the API, you have to install the necessary middlewares. Check if you
have [Node.js](https://nodejs.org/en/) installed in your PC. Open the terminal, go to your inquinapi path and run the
command
``npm install``.

<ins>3. Enjoy your API</ins>

To run the API, type ``npm run debug`` and press enter. Now you can send HTTP requests to the API.

## Middlewares used

| Middleware | Link                              | Description                                       |
|------------|-----------------------------------|---------------------------------------------------|
| Express    | https://expressjs.com/            | Web application framework                         |
| Nodemon    | https://nodemon.io/               | Restart automatically your server                 |
| Helmet     | https://helmetjs.github.io/       | Make secure your server                           |
| Cors       | https://github.com/expressjs/cors | Enable cors on your server                        |
| Dotenv     | https://dotenv.org/vault?r=1      | Load .ENV files                                   |
| Mongoose   | https://mongoosejs.com/           | Connect to your MongoDB database and send queries |
| Lodash     | https://lodash.com/               | JS utility library                                |

## Credits

IMBeniamin: https://github.com/IMBeniamin

userDerpi:  https://github.com/userDerpi

## License

[MIT](https://github.com/IMBeniamin/inquinapi/blob/main/LICENSE)
