const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Server } = require('socket.io');
const http = require('http');
const { Schema } = mongoose;

dotenv.config();

const app = express();
const server = http.createServer(app); // Create server for socket.io
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
});

const PORT = process.env.PORT || 5000;

// MongoDB setup
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// User Schema
const userSchema = new Schema({
  googleId: { type: String, required: true },
  name: String,
  email: String,
  phone: String,
  organization: String,
});
const User = mongoose.model('User', userSchema);

// Request Schema
const requestSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  category: { type: String, required: true },
  comment: { type: String, required: true },
}, { timestamps: true });

const Request = mongoose.model('Request', requestSchema);

// Passport configuration
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  User.findById(id).then(user => done(null, user));
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  let user = await User.findOne({ googleId: profile.id });
  if (!user) {
    user = new User({
      googleId: profile.id,
      name: profile.displayName,
      email: profile.emails[0].value,
    });
    await user.save();
  }
  done(null, user);
}));

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
}));

app.get('/auth/google/callback', passport.authenticate('google', {
  failureRedirect: '/login',
  successRedirect: '/',
}));

app.post('/profile', async (req, res) => {
  const { email, name, phone, organization, googleId } = req.body;
  try {
    let user = await User.findOne({ googleId });
    if (user) {
      user.phone = phone;
      user.organization = organization;
      await user.save();
      res.status(200).send({ message: 'Profile updated successfully' });
    } else {
      res.status(404).send({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error saving profile');
  }
});

app.post('/check-user', async (req, res) => {
  const { email, googleId, name } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email, googleId, name });
      await user.save();
      return res.status(200).send({ exists: false });
    }
    res.status(200).send({ exists: true });
  } catch (err) {
    console.error('Error checking user:', err);
    res.status(500).send({ error: 'Server error' });
  }
});
app.delete('/service/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const deletedRequest = await Request.findByIdAndDelete(id);
      if (!deletedRequest) {
        return res.status(404).send({ message: 'Request not found' });
      }
  
      io.emit('delete-request', { id }); 
      res.status(200).send({ message: 'Request deleted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).send('Error deleting request');
    }
  });
  
app.post('/service', async (req, res) => {
  const { email, name, category, comment } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ name, email });
      await user.save();
    }

    const newRequest = new Request({
      user: user._id,
      category,
      comment,
    });

    await newRequest.save();
    const populatedRequest = await Request.findById(newRequest._id).populate('user');

    io.emit('new-request', populatedRequest); // Emit to all clients

    res.status(201).send({ message: 'Request submitted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error submitting request');
  }
});

app.get('/service/:category', async (req, res) => {
  const category = req.params.category;
  try {
    const requests = await Request.find({ category }).populate('user');
    res.status(200).send(requests);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching requests');
  }
});

app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    res.send(`Hello ${req.user.name}, you are logged in!`);
  } else {
    res.send('Hello, you are not logged in.');
  }
});

// Socket.io setup
io.on('connection', socket => {
  console.log('A client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
