const dbService = require('../../services/db.service');
const logger = require('../../services/logger.service');
const reviewService = require('../review/review.service');
const ObjectId = require('mongodb').ObjectId;

module.exports = {
    query,
    getById,
    getByUsername,
    remove,
    update,
    add,
    getByUID,
    getIsUserTaken,
    getUserByFilter,
};

async function query(filterBy = {}) {
    const criteria = _buildCriteria(filterBy);
    try {
        const collection = await dbService.getCollection('user');
        var users = await collection.find(criteria).toArray();

        users = users.map((user) => {
            delete user.password;
            return user;
        });
        return users;
    } catch (err) {
        logger.error('cannot find users', err);
        throw err;
    }
}

async function getUserByFilter({ by, content }) {
    try {
        let user;
        const collection = await dbService.getCollection('user');
        if (by === 'id')
            user = await collection.findOne({ _id: ObjectId(content) });
        else user = await collection.findOne({ [by]: content });
        delete user.password;
        return user;
    } catch (err) {}
}

async function getById(userId) {
    try {
        const collection = await dbService.getCollection('user');
        const user = await collection.findOne({ _id: ObjectId(userId) });
        delete user.password;
        return user;
    } catch (err) {
        logger.error(`while finding user ${userId}`, err);
        throw err;
    }
}
async function getByUsername(username) {
    try {
        const collection = await dbService.getCollection('user');
        const user = await collection.findOne({ username });
        return user;
    } catch (err) {
        logger.error(`while finding user ${username}`, err);
        throw err;
    }
}

async function getByUID(UID) {
    try {
        const collection = await dbService.getCollection('user');
        const user = await collection.findOne({ UID });
        return user;
    } catch (err) {
        logger.error(`while finding user ${username}`, err);
        throw err;
    }
}

async function getIsUserTaken(username, UID) {
    let isTaken = false;
    let userUsername;
    let userUID;
    const collection = await dbService.getCollection('user');
    try {
        userUID = await collection.findOne({ UID });
        if (userUID) isTaken = true;
    } finally {
        if (!isTaken) userUsername = await collection.findOne({ username });
        if (userUsername) isTaken = true;
        return isTaken;
    }
}

async function getDoctors(filterBy = {}) {
    const criteria = _buildCriteria(filterBy);
    try {
        const collection = await dbService.getCollection('user');
        var users = await collection.find(criteria).toArray();
        users = users.map((user) => {
            delete user.password;

            return user.type === 'doctor';
        });
        return users;
    } catch (err) {
        logger.error('cannot find users', err);
        throw err;
    }
}

async function getPatients(filterBy = {}) {
    const criteria = _buildCriteria(filterBy);
    try {
        const collection = await dbService.getCollection('user');
        var users = await collection.find(criteria).toArray();
        users = users.map((user) => {
            delete user.password;

            return user.type === 'doctor';
        });
        return users;
    } catch (err) {
        logger.error('cannot find users', err);
        throw err;
    }
}

async function remove(userId) {
    try {
        const collection = await dbService.getCollection('user');
        await collection.deleteOne({ _id: ObjectId(userId) });
    } catch (err) {
        logger.error(`cannot remove user ${userId}`, err);
        throw err;
    }
}

async function update(user) {
    try {
        // peek only updatable fields!
        const userToSave = {
            ...user,
            _id: ObjectId(user._id), // needed for the returnd obj
        };
        const collection = await dbService.getCollection('user');
        await collection.updateOne(
            { _id: userToSave._id },
            { $set: userToSave }
        );
        return userToSave;
    } catch (err) {
        logger.error(`cannot update user ${user._id}`, err);
        throw err;
    }
}

async function add(user) {
    try {
        // peek only updatable fields!
        const userToAdd = {
            ...user,
            username: user.username,
            password: user.password,
            UID: user.UID,
            fullname: user.fullname,
            isAdmin: false,
            imgUrl: user.imgUrl,
        };
        if (user.type === 'patient') {
            userToAdd.appointments = [];
            userToAdd.inbox = [];
        } else if (user.type === 'doctor') {
            userToAdd.meetings = [];
            userToAdd.patients = [];
        }
        const collection = await dbService.getCollection('user');
        await collection.insertOne(userToAdd);
        return userToAdd;
    } catch (err) {
        logger.error('cannot insert user', err);
        throw err;
    }
}

function _buildCriteria(filterBy) {
    let criteria = {};
    if (filterBy.txt) {
        const txtCriteria = { $regex: filterBy.txt, $options: 'i' };
        criteria.$or = [
            {
                fullname: txtCriteria,
            },
        ];
    }
    if (filterBy.type) {
        //   const typeCriteria = filterBy.type
        //   criteria.type = {"type":typeCriteria}
        criteria = { type: filterBy.type };
    }
    return criteria;
}
