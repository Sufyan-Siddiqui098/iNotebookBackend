const connectToMongo = require("./db")
const express = require('express')
const app = express()
var cors = require('cors')


const port = 5000 //changed the port from 3000 to 5000 for the sake of running react-app

app.use(cors())
connectToMongo();

app.use(express.json()) 
//Available Routes   require(./routes/auth)-->calling the auth file from router folder
app.use('/api/auth', require('./routes/auth'))
app.use('/api/notes', require('./routes/notes'))

app.listen(port, () => {
  console.log(`iNotebook app listening on port ${port}`)
})
