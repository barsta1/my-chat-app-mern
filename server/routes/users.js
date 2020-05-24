const router = require('express').Router();
let User = require('../models/user.model');

router.route('/').get((req, res) => {
  User.find()
    .then(users => res.json(users))
    .catch(err => res.status(400).json('Error: ' + err))
})

router.route('/add').post((req, res) => {
  console.log(req.body)
  const name = req.body.name;
  const room = req.body.room;
  const userId = req.body.userId
  const newUser = new User({ name, room, userId });

  newUser.save()
    .then(() => res.json('User added'))
    .catch(err => res.status(400).json('Error ' + err))
})

router.route('/:userId').delete((req, res) => {
  User.deleteOne({ userId: req.params.userId })
    .then(() => res.json("User deleted"))
    .catch(err => res.status(400).json('Error: ' + err))
})

module.exports = router;


