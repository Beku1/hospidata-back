const userService = require('./user.service')
const socketService = require('../../services/socket.service')
const logger = require('../../services/logger.service')

// async function getUser(req, res) {
//     try {
//         const user = await userService.getById(req.params.id)
//         res.send(user)
//     } catch (err) {
//         logger.error('Failed to get user', err)
//         res.status(500).send({ err: 'Failed to get user' })
//     }
// }

async function getUser(req, res) {
    try {
        const filterBy ={by:req.query.by, content:req.query.content}
        // const user = await userService.getById(req.params.id)
        const user = await userService.getUserByFilter(filterBy)
        res.send(user)
    } catch (err) {
        logger.error('Failed to get user', err)
        res.status(500).send({ err: 'Failed to get user' })
    }
}

async function getLoggedInUser(req,res){
    try{
       const user = req.session?.user
       delete user.password
       res.send(user)
    }catch(err){
        logger.error('Failed to get Logged in user', err)
        res.status(500).send({ err: 'Failed to get Logged in user' })
    }
}


async function getUsers(req, res) {
    try {
        const filterBy = {
            txt: req.query?.txt || '',
            type:req.query?.type||''
        }
        const users = await userService.query(filterBy)
        console.log(users)
        res.send(users)
    } catch (err) {
        logger.error('Failed to get users', err)
        res.status(500).send({ err: 'Failed to get users' })
    }
}

async function deleteUser(req, res) {
    try {
        await userService.remove(req.params.id)
        res.send({ msg: 'Deleted successfully' })
    } catch (err) {
        logger.error('Failed to delete user', err)
        res.status(500).send({ err: 'Failed to delete user' })
    }
}

async function updateUser(req, res) {
    try {
        const loggedInUser= req.session.user
        const user = req.body
        const savedUser = await userService.update(user)
        if(loggedInUser._id===savedUser._id) req.session.user = savedUser
        res.send(savedUser)
    } catch (err) {
        logger.error('Failed to update user', err)
        res.status(500).send({ err: 'Failed to update user' })
    }
}

module.exports = {
    getUser,
    getUsers,
    deleteUser,
    updateUser,
    getLoggedInUser
}