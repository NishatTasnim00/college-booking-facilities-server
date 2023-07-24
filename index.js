const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

//middle wire
app.use(cors());
app.use(express.json());

const colleges = require('./data/colleges.json');
const research = require('./data/research.json');

const uri = `mongodb+srv://collegeBookingFacilities:DpqIut70Z6tF0AwT@cluster0.oeh6vj2.mongodb.net/?retryWrites=true&w=majority`;

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
		const usersCollection = client
			.db('collegeBookingFacilities')
			.collection('users');
		const candidateCollection = client
			.db('collegeBookingFacilities')
			.collection('candidate');
		const collegesCollection = client
			.db('collegeBookingFacilities')
			.collection('colleges');
			const researchesCollection = client
				.db('collegeBookingFacilities')
				.collection('researches');
// all colleges
		app.get('/colleges', async(req, res) => {
            const result = await collegesCollection.find().toArray();
			res.send(result);
		});


		app.get('/colleges/:name', async(req, res) => {
			const name = req.params.name;
			console.log({name});
			const query = { college_name : name };
			console.log(query);
			const result = await collegesCollection.findOne(query);
			console.log(result);
			res.send(result);
		});

		// Save user email and role in DB during sign up
		app.post('/users', async (req, res) => {
			const user = req.body;
			console.log(user);

			const result = await usersCollection.insertOne(user);
			res.send(result);
		});

		// Save google user email in DB
		app.post('/users/:email', async (req, res) => {
			const email = req.body.email;
			const query = { email: email };
			const user = req.body;
			try {
				const userData = await usersCollection.findOne(query);
				if (!userData) {
					const result = await usersCollection.insertOne(user);
					res.send(result);
				} else {
					return res.status(404).json({ message: 'User already registered!' });
				}
			} catch (error) {
				return res.status(500).json({ message: 'Internal server error' });
			}
		});
		// admission
		app.post('/candidate', async (req, res) => {
			const doc = req.body;
			result = await candidateCollection.insertOne(doc);
			res.send(result);
		});

		// My College Data
		app.get('/myColleges/:email', async (req, res) => {
			const email = req.params.email;
			const query = { email: email };
			const candidateData = await candidateCollection.find(query).toArray();
			const colleges = candidateData.map((data) => data?.college_name);
			const myColleges = await collegesCollection
				.find({ college_name: { $in: colleges } })
				.toArray();
			res.send(myColleges);
		});

		// search

		app.get('/search/:searchText', async(req, res)=>{
			const name = req.params.searchText;
			const query= {college_name:name}
			const result = await collegesCollection.findOne(query);
			res.send(result)
		})

		// research
		app.get('/research', async(req, res) => {
			const result = await researchesCollection.find().toArray();
			res.send(result);
		});
		// review
		app.put('/review/:college_name', async (req, res) => {
			const college_name = req.params.college_name;
			const review = req.body;
			const filter = { college_name: college_name };
			const college = await collegesCollection.findOne(filter);
			const existingReviews = college.reviews || [];
			existingReviews.push(review);
			const updatedDoc = { $set: { reviews: existingReviews } };
			const result = await collegesCollection.updateOne(filter, updatedDoc);
			res.send(result);
		});
// profile info
app.get('/profile/:email', async(req, res)=>{
	const email= req.params.email;
	const query = {email:email};
	const result = await candidateCollection.findOne(query);
	res.send(result);
})
// edit profile
app.put('/updateProfile/:id', async (req, res) => {
	const id = req.params.id;
	console.log(id);
	const body = req.body;
	console.log(body);
	const filter = { _id: new ObjectId(id) };
	// const filter = { email: email };
	const updateData = {
		$set: {
			name: body.name,
			college_name: body.college_name,
			address: body.address,
			email: body.email,
		},
	};
	const result = await candidateCollection.updateOne(filter, updateData);
	res.send(result);
});		

		// Connect the client to the server	(optional starting in v4.7)
		await client.connect();
		// Send a ping to confirm a successful connection
		await client.db('admin').command({ ping: 1 });
		console.log(
			'Pinged your deployment. You successfully connected to MongoDB!'
		);
	} finally {
		// Ensures that the client will close when you finish/error
		// await client.close();
	}
}
run().catch(console.dir);







app.get('/', (req, res) => {
	res.send('college booking facilities is running...');
});
app.listen(port, () => {
	console.log('college booking facilities are running...');
});
