const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();
const port = process.env.PORT;

const logger = (req, res, next) => {
  console.log("loger midelwere loger log", req.params);
  next();
};

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
const savedJobsColl = db.collection("savedJobs");
const paymentHistoryColl = db.collection("paymentHistory");
const sessionColl = db.collection("session");
const UserColl = db.collection("user");

const run = async () => {
  try {
    // TODO:when backend is deployment this line going to commet
    await client.connect();
    // TODO:when backend is deployment this line going to commet
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment!!!!");

    // verifycation realted
    const verifyToken = async (req, res, next) => {
      const authheader = req.headers.authorization;
      if (!authheader) {
        return res.status(401).send({ message: "unauthorization access" });
      }

      const token = authheader?.split(" ")[1];
      if (!token) {
        return res.status(401).send({ message: "unauthorized access" });
      }

      const query = { token: token };
      const session = await sessionColl.findOne(query);
      const userId = session.userId;
      const userQuiry = {
        _id: userId,
      };
      const User = await UserColl.findOne(userQuiry);
      console.log(User);
      req.user = User;
      next();
    };

    // verifySeeker
    const verifySeeker = async (req, res, next) => {
      if (req.user?.role !== "seeker") {
        return res.status(403).send({ message: "forbiddenn access" });
      }
      next();
    };

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
    app.delete("/role_data/:userID", verifyToken, async (req, res) => {
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
      res.json(data);
    });

    // APPLICATIONS SUBMIT API
    app.post("/applications", async (req, res) => {
      const body = req.body;
      const data = await applicationColl.insertOne(body);
      res.send(data);
    });
    // APPLICATIONS GET DATA API
    app.get("/applications", async (req, res) => {
      const data = await applicationColl.find().toArray();
      res.send(data);
    });

    // GET APPLICATION BY APPLICANT ID
    app.get("/applications_get_by_appliID/:id", async (req, res) => {
      const { id } = req.params;
      const data = await applicationColl
        .find({
          applicantId: id,
        })
        .toArray();
      res.send(data);
    });

    // APPLICATIONS SUBMIT PENDING API
    app.get("/applications_pending/:id", async (req, res) => {
      const { id } = req.params;
      const data = await applicationColl
        .find({
          applicantId: id,
          status: "pending",
        })
        .toArray();
      res.send(data);
    });

    // APPLICCATION REJECTION API
    app.get("/applications_rejection/:id", async (req, res) => {
      const { id } = req.params;
      const data = await applicationColl
        .find({
          applicantId: id,
          status: "rejected",
        })
        .toArray();
      res.send(data);
    });

    // APPLICATION FIND BY MY COMPANY ID
    app.get("/applications_jobid/:id", async (req, res) => {
      const { id } = req.params;

      const jobs = await userColl
        .find({
          createdBY: id,
        })
        .toArray();

      const jobIds = jobs.map((e) => e._id.toString());

      const applications = await applicationColl
        .find({
          jobId: { $in: jobIds },
        })
        .toArray();

      res.send(applications);
    });

    // APPLICATION UPDATE STATUS BY RECRUTER
    app.patch("/application_status/:id", async (req, res) => {
      const { id } = req.params;
      const { status } = req.body;
      const query = {
        _id: new ObjectId(id),
      };
      // console.log(status)
      const moire = {
        $set: {
          status: status,
        },
      };
      const result = await applicationColl.updateOne(query, moire);
      res.send(result);
    });

    // APPLICATION OFFERD API GOT FOR SEEKER
    app.get("/application_offerd/:id", async (req, res) => {
      const { id } = req.params;
      const data = await applicationColl
        .find({
          applicantId: id,
          status: "offered",
        })
        .toArray();
      res.send(data);
    });

    // GET SAVED JOBS BY USER ID
    app.get("/getsavedjobs/:id", async (req, res) => {
      const { id } = req.params;
      const data = await savedJobsColl
        .find({
          usersID: id,
        })
        .toArray();
      res.send(data);
    });

    // SAVE JOBS POST
    app.post("/getsavedjobs", async (req, res) => {
      const body = req.body;
      const data = await savedJobsColl.insertOne(body);
      res.send(data);
    });

    // SAVED JOBS DELETE API
    app.delete("/getsavedjobs/:id", async (req, res) => {
      const { id } = req.params;
      const data = await savedJobsColl.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(data);
    });

    // SAVED JOB OPRATION
    // app.patch('/getsavedjobs/:id', async(req, res) => {
    //   const {id} = req.params;
    //   const {saved} = req.body;
    //   const quiry = {
    //     _id: new ObjectId(id)
    //   }
    //   const moire = {
    //     $set:{
    //       saved:saved
    //     }
    //   }
    //   const data = await userColl.updateOne(quiry, moire);
    //   res.send(data);
    // })

    // PAYMENT HISTY POST AND WATCH
    app.post("/paymentHistory", async (req, res) => {
      try {
        const data = req.body;

        const result = await paymentHistoryColl.insertOne(data);

        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Payment history insert failed" });
      }
    });

    // GOT ALL PAYMENT HISTORY
    app.get("/paymentHistory/:id", async (req, res) => {
      const { id } = req.params;
      const data = await paymentHistoryColl
        .find({
          userData: id,
        })
        .toArray();
      res.json(data);
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
