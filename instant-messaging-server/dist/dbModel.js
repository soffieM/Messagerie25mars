"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const bcrypt = require('bcrypt');
const SALT_WORK_FACTOR = 10;
class DbModel {
    constructor() {
        this.database = null;
        mongodb_1.MongoClient
            .connect("mongodb://localhost:27017")
            .then((db) => this.database = db.db('dbMessagerie'))
            .catch((reason) => console.log(reason));
    }
    addUser(username, password, mail) {
        return __awaiter(this, void 0, void 0, function* () {
            const i = yield this.getCountersIdwithIncrementation('idIncrementUser');
            const hash = yield this.hashPassword(password);
            yield this.database.collection('users')
                .insertOne({ _id: i[0].sequence_value, username: username, password: hash, mail: mail,
                contacts: [], invitations: [], id_discussion: [] }); // attention TEST sur contact
        });
    }
    getElementsFromUser(contactOrInvitation, username) {
        return __awaiter(this, void 0, void 0, function* () {
            const id_user = yield this.getUserId(username);
            const userDocument = yield this.database.collection('users').find({ _id: id_user }).toArray();
            if (contactOrInvitation == 'contacts') {
                return userDocument[0].contacts;
            }
            if (contactOrInvitation == 'invitations') {
                return userDocument[0].invitations;
            }
            if (contactOrInvitation == 'id_discussion') {
                return userDocument[0].id_discussion;
            }
        });
    }
    addContactsInUsersCollection(usernameSender, usernameReceiver) {
        return __awaiter(this, void 0, void 0, function* () {
            const iDSender = yield this.getUserId(usernameSender);
            const iDReceiver = yield this.getUserId(usernameReceiver);
            yield this.database.collection('users')
                .update({ _id: iDSender }, { $push: { contacts: { idUser: iDReceiver } } });
        });
    }
    addContactsOrInvitationsInUsersCollection(contactOrInvitation, usernameSender, usernameReceiver) {
        return __awaiter(this, void 0, void 0, function* () {
            const iDSender = yield this.getUserId(usernameSender);
            const iDReceiver = yield this.getUserId(usernameReceiver);
            if (contactOrInvitation == 'contacts') {
                yield this.database.collection('users')
                    .update({ _id: iDSender }, { $push: { contacts: { idUser: iDReceiver } } });
            }
            if (contactOrInvitation == 'invitations') {
                yield this.database.collection('users')
                    .update({ _id: iDSender }, { $push: { invitations: { idUser: iDReceiver } } });
            }
        });
    }
    verifyIfExistInContact_Invitation(contactOrInvitation, usernameSender, usernameReceiver) {
        return __awaiter(this, void 0, void 0, function* () {
            const t = yield this.getElementsFromUser(contactOrInvitation, usernameSender);
            const j = yield this.getUserId(usernameReceiver);
            if (t.length === 0) {
                return 0;
            }
            else {
                let k = 0;
                for (let i = 0; i < t.length; i++) {
                    if (t[i].idUser === j) {
                        k++;
                    }
                }
                return yield k;
            }
        });
    }
    deleteInvitationsOrContacts(contactOrInvitation, usernameSender, usernameReceiver) {
        return __awaiter(this, void 0, void 0, function* () {
            const iDSender = yield this.getUserId(usernameSender);
            const iDReceiver = yield this.getUserId(usernameReceiver);
            //const i = await this.getContactsOrInvitationsOrDiscussionFromUserCollection('contacts',usernameSender);
            if (contactOrInvitation === 'contact') {
                yield this.database.collection('users')
                    .update({ _id: iDSender }, { $pull: { contacts: { idUser: iDReceiver } } });
            }
            if (contactOrInvitation === 'invitation') {
                yield this.database.collection('users')
                    .update({ _id: iDSender }, { $pull: { invitations: { idUser: iDReceiver } } });
            }
        });
    }
    //async addInvitationsInUsersCollection (usernameSender: string, usernameReceiver: string): Promise<void> {
    //const iDSender = await this.getUserId(usernameSender);
    //const iDReceiver = await this.getUserId(usernameReceiver);
    //await this.database.collection('users')
    //.update({_id : iDSender}, {$push: {invitations:{idUser: iDReceiver}}});
    //}
    getContactUser(username) {
        return __awaiter(this, void 0, void 0, function* () {
            const contact = yield this.database.collection('users').find({ username: username }).toArray();
            return contact[0].contacts;
            /*
                On pourra récupérer la liste des contacts ou des invitations dans le client soit avec :
    
                const d = await this.db.getContactUser (username);
                d.forEach(element => {
                    console.log("users = "+ element.idUser);
                });
    
                ou:
    
                for (let i = 0; i < d.length; i++ ){
                    console.log("users = "+ d[i].idUser);
            */
        });
    }
    getInvitationUser(username) {
        return __awaiter(this, void 0, void 0, function* () {
            const contact = yield this.database.collection('users').find({ username: username }).toArray();
            return contact[0].invitations;
        });
    }
    getUserId(username) {
        return __awaiter(this, void 0, void 0, function* () {
            const iD = yield this.database.collection('users').find({ username: username }).toArray();
            return iD[0]._id;
        });
    }
    getUsername(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.database.collection('users').find({ _id: userId }).toArray();
            return user[0].username;
        });
    }
    createDiscussion(iDSender, idContact) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('on entre dans la fonction dbModel createDiscussion');
            const id_discussion = yield this.getCountersIdwithIncrementation('idIncrementDiscussion');
            yield this.database.collection('Discussions')
                .insertOne({ _id: id_discussion[0].sequence_value, users: [iDSender, idContact], history: [] });
            console.log('dbModel id_discussion' + id_discussion[0].sequence_value + 'créée');
            return id_discussion[0].sequence_value;
        });
    }
    addDiscussionIdToUser(userId, id_discussion) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.database.collection('users')
                .update({ _id: userId }, { $push: { id_discussion: { id: id_discussion } } });
        });
    }
    deleteDiscussionFromUser(userId, id_discussion) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.database.collection('users').update({ _id: userId }, { $pull: { id_discussion: id_discussion } });
        });
    }
    addParticipantInDiscussion(id_discussion, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.database.collection('Discussions').update({ _id: id_discussion }, { $push: { users: userId } });
        });
    }
    deleteParticipantFromDiscussion(id_discussion, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.database.collection('Discussions').update({ _id: id_discussion }, { $pull: { users: userId } });
        });
    }
    addMessageInHistory(id_discussion, content, author, date) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.database.collection('Discussions').update({ _id: id_discussion }, { $push: { history: { content: content, author: author, date: date } } });
        });
    }
    getParticipants(id_discussion) {
        return __awaiter(this, void 0, void 0, function* () {
            const discussion = yield this.database.collection('Discussions').find({ _id: id_discussion }).toArray();
            return discussion[0].users;
        });
    }
    getHistory(id_discussion) {
        return __awaiter(this, void 0, void 0, function* () {
            const discussion = yield this.database.collection('Discussions').find({ _id: id_discussion }).toArray();
            return discussion[0].history;
        });
    }
    checkIfUserExists(username) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.database.collection('users').find({ username: username }).count();
        });
    }
    checkIfMailExists(mail) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.database.collection('users').find({ mail: mail }).count();
        });
    }
    hashPassword(password) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield bcrypt.hash(password, SALT_WORK_FACTOR);
        });
    }
    checkIfPasswordMatches(username) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.database.collection('users').find({ username: username }).toArray();
        });
    }
    verifyPasswordWithHashCode(username, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const i = yield this.checkIfPasswordMatches(username);
            const hash = i[0].password;
            return yield bcrypt.compare(password, hash);
        });
    }
    createCountersUser() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.database.collection('idIncrementUser').insertOne({ _id: "tid", sequence_value: 0 });
        });
    }
    createCountersDiscussion() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.database.collection('idIncrementDiscussion').insertOne({ _id: "tid", sequence_value: 0 });
        });
    }
    getCountersIdwithOutIncrementation(collection) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.database.collection(collection).find().toArray();
        });
    }
    getCountersIdwithIncrementation(collection) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.updateId(collection);
                return yield this.database.collection(collection).find().toArray();
            }
            catch (e) {
                console.log('error: ' + e);
            }
        });
    }
    updateId(collection) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.database.collection(collection).updateOne({ _id: "tid" }, { $inc: { sequence_value: 1 } }, true);
            }
            catch (e) {
                console.log('error' + e);
            }
        });
    }
}
exports.DbModel = DbModel;
