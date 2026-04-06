const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;

// Middleware--------------------
app.use(cors());
app.use(express.json());

// Mongodb-Driver-Info-From here
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.w4xj3al.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// app.get("/", (req, res) => {
//   res.send("Server Running");
// });
const db = client.db("B12-A10-Habit-Tracker-DB");
const productsCollection = db.collection("habits");
const habitCollection = db.collection("my-habits");

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // ----------------------------------------------------------------
    // --------------    MongoDB API            -----------------------
    // ----------------------------------------------------------------
    app.post("/habits", async (req, res) => {
      const NewData = req.body;
      const result = await productsCollection.insertOne(NewData);
      res.send(result);
    });

    // Get all Data for public-Habits Section
    app.get("/habits", async (req, res) => {
      const cursor = productsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // Get 6 Data for Home page
    app.get("/recent-habits", async (req, res) => {
      const cursor = productsCollection
        .find()
        .sort({ postCreateTime: -1 })
        .limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/my-habits", async (req, res) => {
      const NewData = req.body;
      const alreadyExist = await habitCollection.findOne({
        id: NewData.id,
        userEmail: NewData.userEmail,
      });

      if (alreadyExist) {
        return res.send({ message: "Already added!" });
      }
      const result = await habitCollection.insertOne(NewData);
      res.send(result);
    });

    app.get("/my-habits", async (req, res) => {
      const carsor = habitCollection.find();
      const result = await carsor.toArray();
      res.send(result);
    });

    app.get("/my-habits/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await habitCollection.findOne(filter);
      res.send(result);
    });

    app.patch("/my-habits/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = { $set: { currentStatus: req.body.currentStatus } };
      const result = await habitCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.delete("/my-habits/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await habitCollection.deleteOne(filter);
      res.send(result);
    });

    // ----------------------------------------------------------------
    // --------------    MongoDB API            -----------------------
    // ----------------------------------------------------------------
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server runing from port: ${port}`);
});
