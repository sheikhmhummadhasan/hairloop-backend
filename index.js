const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const db = client.db("hairloop");
const userColl = db.collection("roles");
const companyColl = db.collection("company");
const applicationColl = db.collection("applications");

const run = async () => {
  try {
    // TODO:when backend is deployment this line going to commet
    await client.connect();
    // TODO:when backend is deployment this line going to commet
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment!!!!");



    // GET ROLE DATA
    app.get("/role", async (req, res) => {
      const data = await userColl.find().toArray();
      res.send(data);
    });
    // GET ROLE DETAIL
    app.get("/role/:id", async (req, res) => {
      const { id } = req.params;
      const data = await userColl.findOne({
        _id: new ObjectId(id),
      });

      res.send(data);
    });
    // GET ROLE BY USERid
    app.get("/role_data/:userID", async (req, res) => {
      const { userID } = req.params;
      const result = await userColl.find({ createdBY: userID }).toArray();
      // console.log({userID, result})
      res.send(result);
    });
    // GET ROLE AND GET USER VERYFIDE BADGE
    app.get("/role_veryfy/:id", async (req, res) => {
      const { id } = req.params;
      const data = await userColl
        .find({
          createdBY: id,
          verifiedBadge: false,
        })
        .toArray();
      res.send(data);
    });
    // ACTIVE JOBS API
    app.get("/role_veryfying/:id", async (req, res) => {
      const { id } = req.params;
      const data = await userColl
        .find({
          createdBY: id,
          verifiedBadge: true,
        })
        .toArray();
      res.send(data);
    });
    // GET ROLE BY USERid and DELETE
    app.delete("/role_data/:userID", async (req, res) => {
      const { userID } = req.params;
      const result = await userColl.deleteOne({
        _id: new ObjectId(userID),
      });
      res.send(result);
    });
    // UPADTE ROLE BU USER ID
    app.patch("/role_data/:userID", async (req, res) => {
      const { userID } = req.params;
      const query = {
        _id: new ObjectId(userID),
      };
      const moire = {
        $set: {
          verifiedBadge: false,
        },
      };
      const result = await userColl.updateOne(query, moire);
      res.send(result);
    });



    // POST JOBS API
    app.post("/role", async (req, res) => {
      const data = req.body;
      console.log(data);
      const result = await userColl.insertOne(data);
      res.send(result);
    });
    // DELETE JOBS API
    app.delete("/role/:id", async (req, res) => {
      const { id } = req.params;
      const result = await userColl.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });
    // JOBS GET DATA API
    app.get("/jobs", async (req, res) => {
      const data = await jobsColl.find().toArray();
      res.send(data);
    });
    // JOBS GET BY ID
    app.get("/jobs/:id", async (req, res) => {
      const { id } = req.params;
      const result = await jobsColl.findOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });



    // COMAPNY DATA POST API
    app.post("/company", async (req, res) => {
      const data = req.body;
      const result = await companyColl.insertOne(data);
      res.send(result);
    });
    // COMPANY DATA GET API
    app.get("/company", async (req, res) => {
      const data = await companyColl.find().toArray();
      res.send(data);
    });
    // GET COMPANY DATA BY ID API
    app.get("/company/:id", async (req, res) => {
      const { id } = req.params;
      const data = await companyColl.findOne({
        createdBY: id,
      });
      res.send(data);
    });



    // APPLICATIONS SUBMIT API
    app.post("/applications", async (req, res) => {
      const body = req.body;
      const data = await applicationColl.insertOne(body);
      res.send(data)
    });
    // APPLICATIONS GET DATA API
    app.get("/applications", async (req, res) => {
      const data = await applicationColl.find().toArray();
      res.send(data);
    });

    // APPLICATIONS SUBMIT PENDING API
    app.get("/applications/:id", async (req, res) => {
      const {id} = req.params;
      const data = await applicationColl.find({
        applicantId:id,
        status:"pending",
      }).toArray();
      res.send(data)
    });

    // APPLICCATION REJECTION API
    app.get("/applications_rejection/:id", async (req, res) => {
      const {id} = req.params;
      const data = await applicationColl.find({
        applicantId:id,
        status:"rejected",
      }).toArray();
      res.send(data)
    });

    // APPLICCATION SELECTION API
    app.get("/applications_selection/:id", async (req, res) => {
      const {id} = req.params;
      const data = await applicationColl.find({
        applicantId:id,
        status:"selection",
      }).toArray();
      res.send(data)
    });
  } finally {
    // await client.close()
  }
};
run().catch(console.dre);

app.get("/", (req, res) => {
  res.send("port is runing success fully");
});

app.listen(port, () => {
  console.log(`Backend is Fine!! with this port ${port}`);
});
