var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bcrypt = require('bcryptjs');
const User = require('./models/user');
const passport = require('passport');
const session = require('express-session')
const LocalStrategy = require("passport-local").Strategy;
const userController = require('./controllers/userController');
const bodyParser = require('body-parser');
const compression = require('compression');

require('dotenv').config();

const mongoose = require('mongoose');
const mongoDb = process.env.MONGODB_KEY;
mongoose.connect(mongoDb, { useNewUrlParser: true, useUnifiedTopology: true });
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const helmet = require('helmet');

var app = express();

app.use(helmet());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

///authentification

app.use(session({ secret: process.env.AUTH_SECRET, resave: false, saveUninitialized: true }));

passport.use(
  new LocalStrategy((username, password, done) => {
    User.findOne({ username: username }, (err, user) => {
      if (err) {
        return done(err);
      }

      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }

      if (password === user.password) {
        return done(null, user);
      } else {
        return done(null, false, { message: "Incorrect passsword" });
      }
    })
  })
)

passport.serializeUser(function (user, done) {
  done(null, user._id);
})

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  })
})

app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));


//---rs
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(compression());
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
})



app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
