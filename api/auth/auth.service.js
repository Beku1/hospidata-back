const bcrypt = require('bcrypt')
const userService = require('../user/user.service')
const logger = require('../../services/logger.service')


async function login(username, password) {
    logger.debug(`auth.service - login with username: ${username}`)
    username = username.toLowerCase()
    const user = await userService.getByUsername(username)
    if (!user) return Promise.reject('Invalid username or password')
    // const match = await bcrypt.compare(password, user.password)
    const match = password === user.password

    if (!match) return Promise.reject('Invalid username or password')

    user._id = user._id.toString()
    
    return user
}

async function signup(username, password, UID, fullname,type,imgUrl) {
 
        const saltRounds = 10

        logger.debug(`auth.service - signup with username: ${username}, fullname: ${UID}`)
        if (!username || !password || !UID) return Promise.reject('fullname, username and password are required!')
    
       let isTaken =  await userService.getIsUserTaken(username.toLowerCase(),UID)
        // const hash = await bcrypt.hash(password, saltRounds)
        // return userService.add({ username:username.toLowerCase(), password: hash, UID,fullname,type,imgUrl })
        if(!isTaken)await userService.add({ username:username.toLowerCase(), password, UID,fullname,type,imgUrl })
        else throw err('Username or UID is already taken')

     


}

module.exports = {
    signup,
    login,
}