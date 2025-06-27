// import express from 'express';
// import { MongoClient } from 'mongodb';
// import cors from 'cors';   // <--- ADD THIS


// const app = express();
// const PORT = 5001;

// const MONGO_URI = 'mongodb://127.0.0.1:27017';
// const DB_NAME = 'practice';

// const client = new MongoClient(MONGO_URI);
// let db;

// // Middleware to parse JSON if needed
// app.use(cors()); // <--- ADD THIS
// app.use(express.json());

// // Connect once and reuse the db
// async function connectDB() {
//   if (!db) {
//     await client.connect();
//     db = client.db(DB_NAME);
//     console.log('✅ Connected to MongoDB');
//   }
// }

// // Add route to add a new message
// app.post('/api/messages', async (req, res) => {
//   try {
//     await connectDB();
//     const collection = db.collection('messages');

//     // Assume the frontend sends { text: "Your message" }
//     const newMessage = {
//       text: req.body.text,
//       timestamp: new Date(),
//     };

//     const result = await collection.insertOne(newMessage);
//     res.json({ status: 'success', id: result.insertedId });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Insert failed' });
//   }
// });

// // Add route to get ALL messages
// app.get('/api/messages', async (req, res) => {
//   try {
//     await connectDB();
//     const collection = db.collection('messages');
//     const messages = await collection.find({}).sort({ timestamp: -1 }).toArray();
//     res.json(messages);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Fetch failed' });
//   }
// });


// // Root route
// app.get('/', (req, res) => {
//   res.send('Hello, world!');
// });

// // Connect to Mongo first, THEN start server
// connectDB().then(() => {
//   app.listen(PORT, () => {
//     console.log(`✅ Server running at http://localhost:${PORT}`);
//   });
// }).catch(err => {
//   console.error('❌ Failed to connect to MongoDB', err);
// });


// index.js

import express from 'express';
import { MongoClient } from 'mongodb';
import cors from 'cors';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = 5001;
const SECRET = 'mysecret'; // use a secure env var in real apps!

const MONGO_URI = 'mongodb://127.0.0.1:27017';
const DB_NAME = 'practice';

const client = new MongoClient(MONGO_URI);
let db;

app.use(cors());
app.use(express.json());

async function connectDB() {
  if (!db) {
    await client.connect();
    db = client.db(DB_NAME);
    console.log('✅ Connected to MongoDB');
  }
}

// ✅ JWT Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user; // attach user payload
    next();
  });
}

// ✅ SIGNUP
app.post('/api/signup', async (req, res) => {
  await connectDB();
  const { username, password } = req.body;
  const users = db.collection('users');

  const existing = await users.findOne({ username });
  if (existing) return res.status(400).json({ message: 'User exists' });

  await users.insertOne({ username, password });
  res.json({ message: 'Signup successful' });
});

// ✅ LOGIN
app.post('/api/login', async (req, res) => {
  await connectDB();
  const { username, password } = req.body;
  const users = db.collection('users');

  const user = await users.findOne({ username });
  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ username }, SECRET, { expiresIn: '1h' });
  res.json({ message: 'Login successful', token });
});

// ✅ Protected: UPDATE
app.post('/api/update', authenticateToken, async (req, res) => {
  await connectDB();
  const messages = db.collection('messages');

  const result = await messages.updateOne(
    { _id: 'myMessage' },
    { $set: { text: `Updated by ${req.user.username}`, timestamp: new Date() } },
    { upsert: true }
  );

  res.json({ status: 'success', result });
});

// ✅ Protected: READ
app.get('/api/message', authenticateToken, async (req, res) => {
  await connectDB();
  const messages = db.collection('messages');

  const doc = await messages.findOne({ _id: 'myMessage' });
  res.json(doc || { text: 'No message found' });
});

// Root
app.get('/', (req, res) => {
  res.send('Hello, world!');
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

