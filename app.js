const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const layouts = require("express-ejs-layouts");
const axios = require("axios");
var debug = require("debug")("personalapp:server");
require('dotenv').config();
//const auth = require('./config/auth.js');

const mongoose = require( 'mongoose' );
//mongoose.connect( `mongodb+srv://${auth.atlasAuth.username}:${auth.atlasAuth.password}@cluster0-yjamu.mongodb.net/authdemo?retryWrites=true&w=majority`);
const mongoDB_URI = process.env.MONGODB_URI
mongoose.connect(mongoDB_URI)

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("we are connected!!!")
});

const authRouter = require('./routes/authentication');
const isLoggedIn = authRouter.isLoggedIn
const loggingRouter = require('./routes/logging');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const toDoRouter = require('./routes/todo');
const toDoAjaxRouter = require('./routes/todoAjax');

const indMinorRouter = require('./routes/indMinor');



const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cors());
app.use(layouts);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(authRouter)
app.use(loggingRouter);
app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use('/todo',toDoRouter);
app.use('/todoAjax',toDoAjaxRouter);

app.use('/im',indMinorRouter);

const myLogger = (req,res,next) => {
  console.log('inside a route!')
  next()
}

app.get('/testing',
  myLogger,
  isLoggedIn,
  (req,res) => {  res.render('testing')
})

app.get('/testing2',(req,res) => {
  res.render('testing2')
})

app.get('/profiles',
    isLoggedIn,
    async (req,res,next) => {
      try {
        res.locals.profiles = await User.find({})
        res.render('profiles')
      }
      catch(e){
        next(e)
      }
    }
  )

app.use('/publicprofile/:userId',
    async (req,res,next) => {
      try {
        let userId = req.params.userId
        res.locals.profile = await User.findOne({_id:userId})
        res.render('publicprofile')
      }
      catch(e){
        console.log("Error in /profile/userId:")
        next(e)
      }
    }
)


app.get('/profile',
    isLoggedIn,
    (req,res) => {
      res.render('profile')
    })

app.get('/editProfile',
    isLoggedIn,
    (req,res) => res.render('editProfile'))

app.post('/editProfile',
    isLoggedIn,
    async (req,res,next) => {
      try {
        let username = req.body.username
        let age = req.body.age
        req.user.username = username
        req.user.age = age
        req.user.imageURL = req.body.imageURL
        await req.user.save()
        res.redirect('/profile')
      } catch (error) {
        next(error)
      }

    })


app.use('/data',(req,res) => {
  res.json([{a:1,b:2},{a:5,b:3}]);
})

const User = require('./models/User');

app.get("/test",async (req,res,next) => {
  try{
    const u = await User.find({})
    console.log("found u "+u)
  }catch(e){
    next(e)
  }

})

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/demo",
        function (req, res){res.render("demo");});

app.get("/about", (request, response) => {
  response.render("about");
});


app.get("/quiz",(req,res) => {
  res.render('quiz')
})

app.post("/answers",(req,res) => {
  const question1 = req.body.question1
  const question2 = req.body.question2
  const question3 = req.body.question3
  const question4 = req.body.question4
  const question5 = req.body.question5
  const question6 = req.body.question6
  const question7 = req.body.question7
  const question8 = req.body.question8
  res.locals.question1 = question1
  res.locals.question2 = question2
  res.locals.question3 = question3
  res.locals.question4 = question4
  res.locals.question5 = question5
  res.locals.question6 = question6
  res.locals.question7 = question7
  res.locals.question8 = question8
  res.render('answers')

})

app.get("/search", (req,res) => {
  res.render('search')
})

app.post("/getInfo", async (req,res,next) => {
  try {
    const keyword = req.body.keyword
    const number = req.body.number
    const url ="https://anapioficeandfire.com/api/"+keyword+"/"+number
    const result = await axios.get(url)
    console.dir(result.data)
    console.log('result')
    res.locals.result = result.data
    res.json(result.data)

  } catch(error){
    console.log("Error in...")
    console.dir(error)
    next(error)
  }
})

app.post("/showformdata", (request,response) => {
  response.json(request.body)
})

app.get("/genre", async(req,res,next) => {
  try{
    res.render('genre')
  }catch(err){
    console.log("Error in....")
    console.dir(err)
    next(err)
  }
})

const Genre = require('./models/Genre')

app.post("/genre", isLoggedIn, async(req,res,next) => {
  try{
    const genre = req.body.genre
    const genredoc = new Genre({
      userId:req.user._id,
      genre:genre
  })
    const result = await genredoc.save()
    console.log('result=')
    console.dir(result)
    res.redirect('/genres')
}catch(err){
  console.log("Error in....")
  console.dir(err)
  next(err)
}
})

app.get('/genres', isLoggedIn, async (req,res,next) => {
  try{
    res.locals.genres = await Genre.find({})
    console.log('genres='+JSON.stringify(res.locals.genres.length))
    res.render('genres')
  }catch(err){
    console.log("Error in....")
    console.dir(err)
    next(err)
  }
})

app.get('/genreremove/:genre_id', isLoggedIn, async (req,res,next) => {
  try{
    const genre_id = req.params.genre_id
    console.log(`id=${genre_id}`)
    await Genre.deleteOne({_id:genre_id})
    res.redirect('/genres')
  }catch(err){
    console.log("Error in....")
    console.dir(err)
    next(err)
  }
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});



// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
