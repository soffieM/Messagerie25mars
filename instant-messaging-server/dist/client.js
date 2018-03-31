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
    constructor(server, connection, mail, db) {
        this.server = server;
        this.connection = connection;
        this.mail = mail;
        this.db = db;
        this.usernameRegex = /^[a-zA-Z0-9]*$/;
        this.username = null;
        this.userId = null;
        this.currentDiscussion = null;
        connection.on('message', (message) => this.onMessage(message.utf8Data));
        connection.on('close', () => server.removeClient(this));
        connection.on('close', () => server.broadcastUsersList());
        connection.on('close', () => server.broadcastUserConnection('disconnection', this.username));
    }
    sendMessage(type, data) {
        const message = { type: type, data: data };
        this.connection.send(JSON.stringify(message));
    }
    sendInstantMessage(content, author, date) {
        const instantMessage = { content: content, author: author, date: date };
        this.sendMessage('instant_message', instantMessage);
    }
    sendUsersList(content) {
        const users_list = content;
        this.sendMessage('users_list', users_list);
    }
    sendOwnUser() {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = this.userId;
            const username = this.username;
            const dataUser = { userId, username };
            this.sendMessage('ownUser', dataUser);
            // await this.sendDiscussionsList(); // redondant avec onUserLogin
            // await this.sendContactsList(); // redondant avec onUserLogin
        });
    }
    sendDiscussionsList() {
        return __awaiter(this, void 0, void 0, function* () {
            const discussions = yield this.db.getElementsFromUser('id_discussion', this.username);
            const discussionsList = [];
            for (let i = 0; i < discussions.length; i++) {
                const id = discussions[i].id;
                const participants = [];
                const participantsComplet = yield this.db.getParticipants(id); // toute l'info user
                for (let i = 0; i < participantsComplet.length; i++) {
                    const userId = participantsComplet[i];
                    if (userId != null) {
                        const username = yield this.db.getUsername(userId);
                        console.log('on ajoute participant = ' + userId + ' de nom = ' + username + ' discussion = ' + id);
                        participants.push({ userId, username });
                    }
                }
                discussionsList.push({ id, participants });
            }
            console.log('discussionsList' + discussionsList);
            this.sendMessage('discussionsList', discussionsList);
        });
    }
    sendContactsList() {
        return __awaiter(this, void 0, void 0, function* () {
            const contacts = yield this.db.getElementsFromUser('contacts', this.username);
            const contactsList = [];
            for (let i = 0; i < contacts.length; i++) {
                const userId = contacts[i].idUser;
                const username = yield this.db.getUsername(userId);
                contactsList.push({ userId, username });
            }
            console.log('contactsList' + contactsList);
            this.sendMessage('contactsList', contactsList);
        });
    }
    sendInvitationsList() {
        return __awaiter(this, void 0, void 0, function* () {
            const invitations = yield this.db.getElementsFromUser('invitations', this.username);
            const invitationsList = [];
            for (let i = 0; i < invitations.length; i++) {
                const userId = invitations[i].idUser;
                console.log("premier id " + userId);
                const username = yield this.db.getUsername(userId);
                console.log("premier nom " + username);
                invitationsList.push(username);
                console.log(username);
            }
            console.log('invitationsList' + invitationsList);
            this.sendMessage('invitationsList', invitationsList);
        });
    }
    sendInvitation(dest, username) {
        return __awaiter(this, void 0, void 0, function* () {
            const invitation = [dest, username];
            this.sendMessage('invitation', invitation);
            console.log("sendinvitation " + invitation);
        });
    }
    sendContact(contact) {
        this.sendMessage('contact', contact);
    }
    sendUserConnection(connection, username) {
        this.sendMessage(connection, username);
    }
    removeInvitation(invitation) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.db.deleteInvitationsOrContacts('invitation', this.username, invitation);
            this.sendInvitationsList();
        });
    }
    removeContact(contact) {
        return __awaiter(this, void 0, void 0, function* () {
            this.sendMessage('removeContact', contact);
            yield this.db.deleteInvitationsOrContacts('contacts', contact, this.username);
            yield this.db.deleteInvitationsOrContacts('contacts', this.username, contact);
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
                this.onAddParticipant(message.data.id, message.data.contactId);
                break;
            case 'quitDiscussion':
                this.onQuitDiscussion(message.data);
                break;
            case 'removeContact':
                this.removeContact(message.data);
                break;
            case 'forgottenpassword':
                this.onPasswordForgotten(message.data);
                break;
        }
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
                    console.log('userid' + this.userId);
                    this.sendOwnUser();
                    this.sendDiscussionsList();
                    this.sendContactsList();
                    this.sendInvitationsList();
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
    onPasswordForgotten(mail) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(mail);
            const i = yield this.db.checkIfMailExists(mail);
            console.log(i);
            if (i === 1) {
                this.mail.sendMail(mail);
                console.log("appel méthode envoi mail");
                return;
            }
            else {
                this.sendMessage('passwordforgotten', 'Adresse mail non reconnue');
                return;
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
        return __awaiter(this, void 0, void 0, function* () {
            if (dest === this.username)
                return;
            //const usernameInvitations = await this.db.getElementsFromUser ('invitations', this.username);
            const id_dest = yield this.db.getUserId(dest);
            const b = yield this.db.verifyIfExistInContact_Invitation('invitations', dest, this.username);
            const c = yield this.db.verifyIfExistInContact_Invitation('contacts', this.username, dest);
            if (b === 0 && c === 0) {
                yield this.db.addContactsOrInvitationsInUsersCollection("invitations", dest, this.username);
            }
            console.log('invitation dest =' + dest);
            console.log('invitation username =' + this.username);
            this.server.sendFriendInvitationsList(dest);
        });
    }
    onContact(friend) {
        return __awaiter(this, void 0, void 0, function* () {
            const b = yield this.db.verifyIfExistInContact_Invitation('contacts', this.username, friend);
            if (b === 0) {
                yield this.db.addContactsOrInvitationsInUsersCollection("contacts", this.username, friend);
                yield this.db.addContactsOrInvitationsInUsersCollection("contacts", friend, this.username);
            }
            this.sendContactsList();
            this.server.sendFriendContactsList(friend);
        });
    }
    onCreateDiscussion(contactId) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('client.ts on entre dans la fonction onCreateDiscussion avec ' + this.username + '' + contactId);
            const id = yield this.db.createDiscussion(this.userId, contactId);
            this.onFetchDiscussion(id);
            console.log('a chargé la disc ' + id + '; client.ts onCreateDiscussion ' + contactId + ' terminé');
            this.sendDiscussionsList();
            this.server.broadcastCreateDiscussion(contactId, id);
            yield this.db.addDiscussionIdToUser(this.userId, id);
        });
    }
    onFetchDiscussion(id) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('client.ts on entre dans la fonction onFetchDiscussion ' + id);
            this.currentDiscussion = id;
            const participants = yield this.db.getParticipants(id);
            const history = yield this.db.getHistory(id);
            const discussion = { id, participants, history };
            this.sendMessage('discussion', discussion);
        });
    }
    onFetchDiscussionCondition(id) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('client.ts on entre dans la fonction onFetchDiscussionCondition ' + id);
            if (this.currentDiscussion == id)
                this.onFetchDiscussion(id);
        });
    }
    onAddParticipant(id, contactId) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('client.ts ajout participant ' + contactId + ' a la discussion ' + id);
            yield this.db.addDiscussionIdToUser(contactId, id);
            yield this.db.addParticipantInDiscussion(id, contactId);
            this.sendDiscussionsList();
            this.server.broadcastUpdateDiscussionList(id);
        });
    }
    onQuitDiscussion(id) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(this.userId + 'quitte discussion' + id);
            yield this.db.deleteParticipantFromDiscussion(id, this.userId);
            yield this.db.deleteDiscussionFromUser(this.userId, id);
            this.sendDiscussionsList(); // nécessaire mais pourquoi ?
            this.server.broadcastUpdateDiscussionList(id);
        });
    }
    getUserName() {
        return this.username;
    }
    getUserId() {
        return this.userId;
    }
}
exports.Client = Client;
