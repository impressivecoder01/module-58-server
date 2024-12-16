const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const jwt = require('jsonwebtoken')
const app = express();
const cookieParser = require('cookie-parser')
require("dotenv").config();
const port = process.env.PORT || 3000;

// job_hunter
// fiAkSLPhmBqg2nH3

app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

const logger = (req, res, next) => {
  console.log('inside the logger')
    next();
  
}


const verifyToken = (req, res, next) => {
  console.log('inside verify token middleware', req.cookies);
  const token = req?.cookies?.token;
  if(!token){
    return res.status(401).send({message: 'Unauthorized access'})  
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded)=>{
    if(err){
      return res.status(401).send({message: 'Authorized access'})
    }
    next()
  })
  // const token = req.cookies;
  
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.h77hn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const jobCollection = client.db("jobPortal").collection("jobs");
    const jobApplicationCollection = client
      .db("jobPortal")
      .collection("job_applications");
    // Auth related APIs
    app.post('/jwt', async(req, res)=>{
      const user = req.body;
      const token = jwt.sign(user, process.env.JWT_SECRET, {expiresIn: '1h'})
      res.cookie('token', token,{
        httpOnly: true,
        secure: false,
      })
      res.send({success: true});
    })

    app.get("/jobs", logger,verifyToken, async (req, res) => {
      console.log('now api ')
      const cursor = jobCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobCollection.findOne(query);
      res.send(result);
    });

    app.post("/jobs", async (req, res) => {
      const newJob = req.body;
      const result = await jobCollection.insertOne(newJob);
      res.send(result);
    });

    // job application api
    app.post("/job_applications",verifyToken, async (req, res) => {
      const application = req.body;
      const result = await jobApplicationCollection.insertOne(application);
      res.send(result);
    });

    app.get("/job_application", async (req, res) => {
      const email = req.query.email;
      const query = { applicant_email: email };
      console.log(req.cookies)
      const result = await jobApplicationCollection.find(query).toArray();

      // not the best way
      for (const application of result) {
        console.log(application.job_id);
        const query1 = { _id: new ObjectId(application.job_id) };
        const result1 = await jobCollection.findOne(query1);
        if (result1) {
          application.title = result1.title;
          application.company = result1.company;
        }
      }
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("job is done");
});

app.listen(port, () => {
  console.log("job portal", port);
});
