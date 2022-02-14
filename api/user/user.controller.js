const userService = require('./user.service');
const socketService = require('../../services/socket.service');
const logger = require('../../services/logger.service');

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
        const filterBy = { by: req.query.type, content: req.query.userId };
        // const user = await userService.getById(req.params.id)

        const user = await userService.getUserByFilter(filterBy);
        res.send(user);
    } catch (err) {
        logger.error('Failed to get user', err);
        res.status(500).send({ err: 'Failed to get user' });
    }
}

async function getLoggedInUser(req, res) {
    try {
        const loggedInUser = req.session?.user;
        const user = await userService.getByUID(loggedInUser.UID);
        delete user.password;
        res.send(user);
    } catch (err) {
        logger.error('Failed to get Logged in user', err);
        res.status(500).send({ err: 'Failed to get Logged in user' });
    }
}

async function getUsers(req, res) {
    try {
        const filterBy = {
            txt: req.query?.txt || '',
            type: req.query?.type || '',
        };
        const users = await userService.query(filterBy);
        res.send(users);
    } catch (err) {
        logger.error('Failed to get users', err);
        res.status(500).send({ err: 'Failed to get users' });
    }
}

async function deleteUser(req, res) {
    try {
        await userService.remove(req.params.id);
        res.send({ msg: 'Deleted successfully' });
    } catch (err) {
        logger.error('Failed to delete user', err);
        res.status(500).send({ err: 'Failed to delete user' });
    }
}

async function updateUser(req, res) {
    try {
        const loggedInUser = req.session.user;
        const user = req.body;
        const savedUser = await userService.update(user);
        socketService.emitToUser({
            type: 'user-updated',
            data: savedUser,
            userId: savedUser._id,
        });
        console.log(
            'file: user.controller.js   line 68   savedUser',
            savedUser
        );

        if (loggedInUser.UID === savedUser.UID) req.session.user = savedUser;
        res.send(savedUser);
    } catch (err) {
        logger.error('Failed to update user', err);
        res.status(500).send({ err: 'Failed to update user' });
    }
}

module.exports = {
    getUser,
    getUsers,
    deleteUser,
    updateUser,
    getLoggedInUser,
};
