import express from 'express'

const server = express()
const port = 5000
server.use(express.json())

server.get('/friends/:id', (req, res) => {
    
})

server.listen(port, '0.0.0.0', () => {
    console.log(`listening on port ${port}`)
})