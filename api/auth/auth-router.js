const express = require('express')
const bcrypt = require('bcryptjs')
const router = express.Router()
const User = require('../users/users-model')


router.post('/register', async (req, res, next) => {
    try {
        const {username, password} = req.body
        const hash = bcrypt.hashSync(password, 8) //means 2^8 times hashing
        const newUser = { username, password: hash}
        const result = await User.add(newUser)
        res.status(201).json({
            message: `nice to have you, ${result.username}`
        })
    }
    catch (error) {
        next(error)
    }
})
router.post('/login', async (req, res, next) => {
    try {
        const {username, password} = req.body
        const [user] = await User.findBy({username})//destructure first user from array
        if (user && bcrypt.compareSync(password, user.password)) {//if creds match
            req.session.user = user //signals the Express session library that a session must be saved
            res.json({message: 'welcome back'})
        }
        else {
            next({status: 401, message: 'bad credentials'})
        }
    }
    catch (error) {
        next(error)
    }
})



router.get('/logout', async (req, res, next) => {
    if (req.session.user) {//does a session exist?
        const {username} = req.session.user
        req.session.destroy(err => {
            if (err) {
                res.json({message: `you can never leave ${username}`})
            }
            else {
                res.set('Set-cookie', 'monkey=; SameSite=Strict; Path=/; Expires=Thu, 01 Jan 1970 00:00:00')
                res.json({message: `goodbye ${username}`})
            }
        })
    }
    else {
        res.json({message: 'sorry have we met?'})
    }
})


module.exports = router