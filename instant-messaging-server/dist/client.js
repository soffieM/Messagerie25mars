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
class Client {
    constructor(server, connection, db) {
        this.server = server;
        this.connection = connection;
        this.db = db;
        this.usernameRegex = /^[a-zA-Z0-9]*$/;
        this.username = null;
        this.userId = null;
        connection.on('message', (message) => this.onMessage(message.utf8Data));
        connection.on('close', () => server.removeClient(this));
        connection.on('close', () => server.broadcastUsersList());
        connection.on('close', () => server.broadcastUserConnection('disconnection', this.username));
    }
    sendMessage(type, data) {
        const message = { type: type, data: data };
        this.connection.send(JSON.stringify(message));
    }
    sendUsersList(content) {
        const users_list = content;
        this.sendMessage('users_list', users_list);
    }
    sendInstantMessage(content, author, date) {
        const instantMessage = { content: content, author: author, date: date };
        this.sendMessage('instant_message', instantMessage);
    }
    sendOwnUser(username) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = this.userId;
            const invitations = yield this.db.getContactsOrInvitationsOrDiscussionFromUserCollection('invitations', username);
            const con = yield this.db.getContactsOrInvitationsOrDiscussionFromUserCollection('contacts', username);
            const contacts = [];
            for (let i = 0; i < con.length; i++) {
                contacts[i] = con[i].idUser;
                console.log('contact = ' + contacts[i]);
            }
            const discussions = yield this.db.getContactsOrInvitationsOrDiscussionFromUserCollection('id_discussion', username);
            const dataUser = { userId, username, invitations, contacts, discussions };
            this.sendMessage('ownUser', dataUser);
        });
    }
    sendDiscussionsList(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const discussions = yield this.db.getContactsOrInvitationsOrDiscussionFromUserCollection('id_discussion', this.username);
            const discussionsList = [];
            for (let i = 0; i < discussions.length; i++) {
                const id = discussions[i].id;
                const participants = [];
                const participantsComplet = yield this.db.getParticipants(id); // toute l'info user
                for (let i = 0; i < participantsComplet.length; i++) {
                    const userId = participantsComplet[i];
                    const username = yield this.db.getUsername(userId);
                    console.log('on ajoute participant = ' + userId + 'de nom = ' + username + 'discussion = ' + id);
                    participants.push({ userId, username });
                }
                discussionsList.push({ id, participants });
            }
            console.log('discussionsList' + discussionsList);
            this.sendMessage('discussionsList', discussionsList);
        });
    }
    sendInvitation(dest, username) {
        return __awaiter(this, void 0, void 0, function* () {
            if (dest === username)
                return;
            const invitation = [dest, username];
            this.sendMessage('invitation', invitation);
            const usernameInvitations = yield this.db.getContactsOrInvitationsOrDiscussionFromUserCollection('invitations', this.username);
            const id_dest = yield this.db.getUserId(dest);
            const b = yield this.db.verifyIfExistInContact_Invitation('invitations', username, dest);
            if (b === 0) {
                yield this.db.addContactsOrInvitationsInUsersCollection("invitations", username, dest);
            }
        });
    }
    sendContact(dest, username) {
        const contact = [dest, username];
        this.sendMessage('contact', contact);
    }
    sendUserConnection(connection, username) {
        this.sendMessage(connection, username);
    }
    onUserLogin(username, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const i = yield this.db.checkIfUserExists(username);
            if (i === 1) {
                const verifyPassword = yield this.db.verifyPasswordWithHashCode(username, password);
                if (!verifyPassword) {
                    this.sendMessage('login', 'Mot de passe incorrect');
                    return;
                }
                else {
                    this.username = username;
                    this.sendMessage('login', 'ok');
                    this.userId = yield this.db.getUserId(username);
                    console.log("userid " + this.userId);
                    this.sendOwnUser(username);
                    this.sendDiscussionsList(this.userId);
                    this.server.broadcastUsersList();
                    this.server.broadcastUserConnection('connection', username);
                }
            }
            else {
                this.sendMessage('login', 'Login non reconnu');
                return;
            }
        });
    }
    onUserSubscription(username, password, mail) {
        return __awaiter(this, void 0, void 0, function* () {
            const i = yield this.db.checkIfMailExists(mail);
            const j = yield this.db.checkIfUserExists(username);
            if (i === 1) {
                this.sendMessage('subscription', 'Compte déjà existant');
                return;
            }
            else if (j === 1) {
                this.sendMessage('subscription', 'Pseudo déjà utilisé');
                return;
            }
            else {
                this.db.addUser(username, password, mail);
                this.sendMessage('subscription', 'ok');
            }
        });
    }
    onInstantMessage(discussionId, content, participants) {
        if (!(typeof 'content' === 'string'))
            return;
        if (this.username == null)
            return;
        this.server.broadcastInstantMessage(discussionId, content, this.username, participants);
    }
    onInvitation(dest) {
        this.server.broadcastInvitation(dest, this.username);
    }
    removeInvitation(invitation) {
        return __awaiter(this, void 0, void 0, function* () {
            this.sendMessage('removeInvitation', invitation);
            yield this.db.deleteInvitationsOrContacts('invitation', invitation, this.username);
        });
    }
    onOkInvitation(contact) {
        return __awaiter(this, void 0, void 0, function* () {
            const okInvitation = contact;
            this.sendMessage('okInvitation', okInvitation);
        });
    }
    onContact(dest) {
        return __awaiter(this, void 0, void 0, function* () {
            const b = yield this.db.verifyIfExistInContact_Invitation('contacts', this.username, dest);
            if (b === 0) {
                yield this.db.addContactsOrInvitationsInUsersCollection("contacts", this.username, dest);
                yield this.db.addContactsOrInvitationsInUsersCollection("contacts", dest, this.username);
            }
            this.server.broadcastContact(dest, this.username);
        });
    }
    onCreateDiscussion(contact) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('client.ts on entre dans la fonction onCreateDiscussion avec ' + this.username + '' + contact);
            const id = yield this.db.createDiscussion(this.username, contact);
            this.onFetchDiscussion(id);
            console.log('a chargé la disc ' + id + '; client.ts onCreateDiscussion ' + contact + ' terminé');
            yield this.db.addDiscussionIdToUser(this.username, id);
            console.log('a ajouté la discussion' + id + 'à ' + this.username);
            //this.server.broadcastCreateDiscussion(contact, id);
            //await this.db.addDiscussionIdToUser(contact, id);
            console.log('n a pas ajouté la discussion' + id + 'à ' + contact);
        });
    }
    onFetchDiscussion(id) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('client.ts on entre dans la fonction onFetchDiscussion ' + id);
            const participants = yield this.db.getParticipants(id);
            const history = yield this.db.getHistory(id);
            const discussion = { id, participants, history };
            this.sendMessage('discussion', discussion);
        });
    }
    onAddParticipant(id, contactId) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('client.ts ajout participant a la discussion ' + id);
            yield this.db.addDiscussionIdToUser(contactId, id);
            yield this.db.addParticipantInDiscussion(id, contactId);
            this.server.broadcastFetchDiscussion(id);
        });
    }
    onQuitDiscussion(id) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(this.userId + 'quitte discussion' + id);
            yield this.db.deleteParticipantFromDiscussion(this.userId, id);
            yield this.db.deleteDiscussionFromUser(id, this.userId);
            this.server.broadcastFetchDiscussion(id);
        });
    }
    onMessage(utf8Data) {
        const message = JSON.parse(utf8Data);
        switch (message.type) {
            case 'instant_message':
                this.onInstantMessage(message.data.discussionId, message.data.content, message.data.participants);
                break;
            case 'userSubscription':
                this.onUserSubscription(message.data.username, message.data.password, message.data.mail);
                break;
            case 'userLogin':
                this.onUserLogin(message.data.username, message.data.password);
                break;
            case 'invitation':
                this.onInvitation(message.data);
                break;
            case 'okInvitation':
                this.onOkInvitation(message.data);
                break;
            case 'removeInvitation':
                this.removeInvitation(message.data);
                break;
            case 'contact':
                this.onContact(message.data);
                break;
            case 'createDiscussion':
                this.onCreateDiscussion(message.data);
                break;
            case 'discussion':
                this.onFetchDiscussion(message.data);
                break;
            case 'addParticipant':
                this.onAddParticipant(message.data.discussionId, message.data.contactId);
                break;
            case 'quitDiscussion':
                this.onQuitDiscussion(message.data);
                break;
        }
    }
    getUserName() {
        return this.username;
    }
    getUserId() {
        return this.userId;
    }
}
exports.Client = Client;
