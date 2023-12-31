require('dotenv').config()
const express = require('express')
const app = express()
const path = require('path')
const { logger, logEvents } = require('./middleware/logger')
const errorHandler = require('./middleware/errorHandler')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const corsOptions = require('./config/corsOptions')
const connectDB  = require('./config/dbConn')
const mongoose = require('mongoose')
const PORT = process.env.PORT || 3000

connectDB()

app.use(logger)

app.use(cors(corsOptions))

app.use(cookieParser())

app.use(express.json())

app.use('/', express.static(path.join(__dirname, 'public')))

app.use('/', require('./routes/root'))
app.use('/users', require('./routes/userRoutes'))

app.all('*', (req, res) => {
    res.status(404)
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'))
    } else if (req.accepts('json')) {
        res.json({ message : '404: Not found'})
    } else {
        res.type('txt').send('404: Not found')
    }
})

app.use(errorHandler)

mongoose.connection.once('open', () => {
    console.log('Connected to DB')
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
})

mongoose.connection.on('error', err =>{
    console.error(err)
})