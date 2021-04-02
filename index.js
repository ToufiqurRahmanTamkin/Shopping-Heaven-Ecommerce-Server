const express = require('express')
const ObjectID = require('mongodb').ObjectID;
const cors = require('cors');
require('dotenv').config()
const app = express()
const port = 5000

app.use(cors());
app.use(express.json());

const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.z8m97.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
  const collection = client.db("freshValley").collection("store");

  console.log("database connected");
  app.get('/', (req, res) => {
    collection.find().toArray((err, items) => {
      res.send(items);
    })
  })

  app.get('/:id', (req, res) => {
    const id = ObjectID(req.params.id);

    collection.findOne({ _id: id }, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
      }
    });
  })


  app.post('/addProduct', (req, res) => {
    const newEvent = req.body;
    console.log('adding new event: ', newEvent)
    collection.insertOne(newEvent)
      .then(result => {
        console.log('inserted count', result.insertedCount);
        res.send(result.insertedCount > 0)
      })
  })

  app.delete('/deleteProduct/:id', (req, res) => {
    collection.deleteOne({ _id: ObjectID(req.params.id) })
      .then(result => {
        res.send(result.deletedCount > 0)
      })
  })

  app.put('/updateProduct/:id', (req, res) => {

    console.log(req.body);
    const item = {
      time: new Date().toLocaleString()
    }
    collection.findOneAndUpdate({ _id: ObjectID(req.params.id) }, { $set: item }, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
      }
    })

  })
});

app.listen(process.env.PORT || port)