const express = require('express')
const app = express()
const mongoose = require("mongoose");
const apiCall = require('./routes/API')
const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression')
//require('dotenv/config');

app.use('/api/',apiCall)
app.use(cors())
app.use(helmet())
app.use(compression())
mongoose.set('debug', true);
try {
    mongoose.connect(process.env.CONNECTION_STRING,() =>{
        console.log(`Connecting successfully with inquinator database`)
    })
} catch (error) {
    console.log({message: error})
}

const port = process.env.PORT || 80
app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
})
