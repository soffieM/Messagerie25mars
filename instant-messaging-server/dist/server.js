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
const websocket_1 = require("websocket");
const http = require("http");
const client_1 = require("./client");
const dbModel_1 = require("./dbModel");
const sendmail_1 = require("./sendmail");
class Server {
    constructor(port) {
        this.clients = [];
        this.db = new dbModel_1.DbModel();
        this.mail = new sendmail_1.Mail(this.db);
        const server = this.createAndRunHttpServer(port);
        this.addWebSocketServer(server);
    }
    broadcastInstantMessage(discussionId, content, author, participants) {
        return __awaiter(this, void 0, void 0, function* () {
            const date = new Date();
            for (const client of this.clients) {
                if (!(participants.indexOf(client.getUserId()) === -1))
                    client.sendInstantMessage(content, author, date);
            }
            yield this.db.addMessageInHistory(discussionId, content, author, date);
        });
    }
    broadcastUsersList() {
        for (const client of this.clients) {
            client.sendUsersList(this.getClientsList());
        }
    }
    sendFriendInvitationsList(friend) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const client of this.clients) {
                if (client.getUserName() === friend) {
                    client.sendInvitationsList();
                }
            }
        });
    }
    sendFriendContactsList(friend) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const client of this.clients) {
                if (client.getUserName() === friend) {
                    client.sendContactsList();
                }
            }
        });
    }
    broadcastCreateDiscussion(contactId, discussionId) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const client of this.clients) {
                if (client.getUserId() === contactId) {
                    client.sendDiscussionsList();
                    console.log('mise à jour discussion ' + discussionId);
                    yield this.db.addDiscussionIdToUser(contactId, discussionId);
                }
            }
        });
    }
    broadcastUpdateDiscussionList(discussionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const participants = yield this.db.getParticipants(discussionId);
            for (const client of this.clients) {
                if (!(participants.indexOf(client.getUserId()) == -1)) {
                    client.sendDiscussionsList();
                    client.onFetchDiscussionCondition(discussionId);
                }
            }
        });
    }
    sendFriendsContactsList(usernameOri) {
        return __awaiter(this, void 0, void 0, function* () {
            const contacts = yield this.db.getElementsFromUser('contacts', usernameOri);
            const contactsList = [];
            for (let i = 0; i < contacts.length; i++) {
                const userId = contacts[i].idUser;
                const username = yield this.db.getUsername(userId);
                contactsList.push(username);
            }
            for (const client of this.clients) {
                const index = contactsList.indexOf(client.getUserName());
                if (index !== -1) {
                    client.sendContactsList();
                }
            }
            this.broadcastUsersList();
        });
    }
    broadcastDiscussionsListOnNewName(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const username = yield this.db.getUsername(userId);
            const discussions = yield this.db.getElementsFromUser('id_discussion', username);
            var participantsList = [];
            var discussionsList = [];
            for (let i = 0; i < discussions.length; i++) {
                const id = discussions[i].id;
                discussionsList.push(id);
                const participantsComplet = yield this.db.getParticipants(id);
                for (let i = 0; i < participantsComplet.length; i++) {
                    const userId = participantsComplet[i];
                    if (userId != null) {
                        participantsList.push(userId);
                    }
                }
            }
            for (const client of this.clients) {
                if (!(participantsList.indexOf(client.getUserId()) == -1)) {
                    client.sendDiscussionsList();
                    for (const discussion of discussionsList) {
                        client.onFetchDiscussionCondition(discussion);
                    }
                }
            }
        });
    }
    broadcastFetchDiscussion(discussionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const participants = yield this.db.getParticipants(discussionId);
            for (const client of this.clients) {
                if (!(participants.indexOf(client.getUserId()) == -1))
                    client.onFetchDiscussion(discussionId);
            }
        });
    }
    broadcastUserConnection(connection, username) {
        switch (connection) {
            case 'connection':
                for (const client of this.clients) {
                    client.sendUserConnection('connection', username);
                }
                ;
                break;
            case 'disconnection':
                for (const client of this.clients) {
                    client.sendUserConnection('disconnection', username);
                }
                ;
                break;
        }
    }
    getClientsList() {
        var usersList = [];
        for (const client of this.clients) {
            usersList.push(client.getUserName());
        }
        return usersList;
    }
    createAndRunHttpServer(port) {
        const server = http.createServer(function (request, response) {
            response.writeHead(404);
            response.end();
        });
        server.listen(port, function () {
            console.log((new Date()) + ' Server is listening on port ' + port);
        });
        return server;
    }
    addWebSocketServer(httpServer) {
        const webSocketServer = new websocket_1.server({
            httpServer: httpServer,
            autoAcceptConnections: false
        });
        webSocketServer.on('request', request => this.onWebSocketRequest(request));
    }
    onWebSocketRequest(request) {
        const connection = request.accept(null, request.origin);
        const client = new client_1.Client(this, connection, this.mail, this.db);
        this.clients.push(client);
    }
    removeClient(client) {
        this.clients.splice(this.clients.indexOf(client), 1);
    }
}
exports.Server = Server;
