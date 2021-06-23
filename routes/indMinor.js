/*
  indMinor.js -- Router for the ToDoList
*/
const express = require('express');
const router = express.Router();
const IndMinor = require('../models/IndMinor')
const IndMinorCourse = require('../models/IndMinorCourse')


/*
this is a very simple server which maintains a key/value
store using an object where the keys and values are lists of strings

*/

isLoggedIn = (req,res,next) => {
  if (res.locals.loggedIn) {
    next()
  } else {
    res.redirect('/login')
  }
}

// get the value associated to the key
router.get('/',
  isLoggedIn,
  async (req, res, next) => {
      res.locals.indMinors = await IndMinor.find({})
      res.render('indMinor');
});

router.get('/:minorId',
  isLoggedIn,
  async (req, res, next) => {
      const minorId = req.params.minorId
      res.locals.im = await IndMinor.findOne({_id:minorId})
      res.locals.courses = await IndMinorCourse.find({minorId:minorId})
      //console.log(`courses=${JSON.stringify(res.locals.courses)}`)
      res.render('indMinorPage');
});

router.get('/delete/:minorId',
  isLoggedIn,
  async (req,res,next) => {
      // delete the minor from the collection of minors
      await IndMinor.remove({_id:req.params.minorId})
      // also delete all of the courses associated with that minor!
      await IndMinor.remove({minorId:req.params.minorId})
      res.redirect('/')
})


/* add the value in the body to the list associated to the key */
router.post('/',
  isLoggedIn,
  async (req, res, next) => {
      const im = new IndMinor(
        {title:req.body.title,
         createdAt: new Date(),
         ownerId: req.user._id,
        })
      await im.save();
      //res.render("todoVerification")
      res.redirect('/im')
});


// handle data about adding new course to a minor
router.post('/addCourse/:minorId',
  isLoggedIn,
  async (req, res, next) => {
      const imdata =
      {course:req.body.course,
       minorId:req.params.minorId,
       createdAt: new Date(),
       ownerId: req.user._id,
      }
      console.log("imdata = ")
      console.dir(imdata)
      const imc = new IndMinorCourse(imdata)
      await imc.save();
      //res.render("todoVerification")
      res.redirect('/im/'+req.params.minorId)
});

module.exports = router;
