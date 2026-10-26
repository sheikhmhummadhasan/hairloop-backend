const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const db = client.db('hairloop');
const userColl = db.collection('roles')

const run = async () => {
    try {
        // TODO:when backend is deployment this line going to commet
        await client.connect();
        // TODO:when backend is deployment this line going to commet
        await client.db('admin').command({ ping: 1 })
        console.log("Pinged your deployment!!!!");
    }
    finally {
        // await client.close()
    }
}
run().catch(console.dre);

app.get('/', (req, res) => {
    res.send('port is runing success fully')
})

app.listen(port, () => {
    console.log(`Backend is Fine!! with this port ${port}`)
})