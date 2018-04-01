import {server as WebSocketServer, connection as WebSocketConnection} from 'websocket';
import * as http from 'http';
import { Client } from "./client";
import { DbModel } from "./dbModel";
import { Mail } from "./sendmail";

export class Server {
    private clients: Client[] = []
    db: DbModel = new DbModel();
    mail: Mail = new Mail (this.db);
        
    public constructor(port: number) {
        const server = this.createAndRunHttpServer(port);
        this.addWebSocketServer(server);
    }
       
    async broadcastInstantMessage(discussionId: string, content: string, author: string, participants: string[]){
        const date = new Date();
        for (const client of this.clients) {
            if (!(participants.indexOf(client.getUserId())===-1))
              client.sendInstantMessage(content, author, date);
        }
        await this.db.addMessageInHistory(discussionId, content, author, date);
      }
    
    public broadcastUsersList(): void {
        for (const client of this.clients) {
          client.sendUsersList(this.getClientsList());
        }
      }

      async sendFriendInvitationsList (friend: string){
        for(const client of this.clients){
            if (client.getUserName() === friend){
                client.sendInvitationsList();
            }
        }
    } 
    
    async sendFriendContactsList (friend: string){
        for(const client of this.clients){
            if (client.getUserName() === friend){
                client.sendContactsList();
            }
        }
    } 

    async broadcastCreateDiscussion(contactId, discussionId){
        for(const client of this.clients){
            if (client.getUserId() === contactId){
                client.sendDiscussionsList();
                console.log('mise à jour discussion ' + discussionId);
                await this.db.addDiscussionIdToUser(contactId, discussionId);
            }
        }     
    }

    async broadcastUpdateDiscussionList(discussionId){
        const participants = await this.db.getParticipants(discussionId);
        for (const client of this.clients){
            if (!(participants.indexOf(client.getUserId()) == -1)) {
                client.sendDiscussionsList();
                client.onFetchDiscussionCondition(discussionId);
            }
        }  
    }

    async sendFriendsContactsList (usernameOri: string){
        const contacts = 
        await this.db.getElementsFromUser('contacts', usernameOri);
        const contactsList: any[] =[];
        for (let i = 0; i < contacts.length; i++){
            const userId = contacts[i].idUser;
            const username = await this.db.getUsername(userId);
            contactsList.push(username);
        }
        for(const client of this.clients){
            const index = contactsList.indexOf(client.getUserName())
            if (index !== -1){
                client.sendContactsList();
            }
        }
        this.broadcastUsersList();
    } 

    async broadcastDiscussionsListOnNewName(userId){
        const username = await this.db.getUsername(userId);
        const discussions = await this.db.getElementsFromUser('id_discussion', username); 
        var participantsList = [];
        var discussionsList = [];
        for (let i = 0; i < discussions.length; i++){
            const id = discussions[i].id;
            discussionsList.push(id);
            const participantsComplet = await this.db.getParticipants(id);
            for (let i = 0; i < participantsComplet.length; i++){
                const userId = participantsComplet[i];
                if (userId != null) { 
                    participantsList.push(userId);
                }
            }
        }
        for (const client of this.clients){
            if (!(participantsList.indexOf(client.getUserId()) == -1)) {
                client.sendDiscussionsList();
                for (const discussion of discussionsList) {
                    client.onFetchDiscussionCondition(discussion); 
                }
            }
        } 
    }

    async broadcastFetchDiscussion(discussionId){
        const participants = await this.db.getParticipants(discussionId);
        for (const client of this.clients){
            if (!(participants.indexOf(client.getUserId()) == -1))
                client.onFetchDiscussion(discussionId);
        }
    }

    public broadcastUserConnection(connection: string, username: string): void {
        switch (connection) {
            case 'connection': for (const client of this.clients) {
                client.sendUserConnection('connection', username);
            }; break;
            case 'disconnection': for (const client of this.clients) {
                client.sendUserConnection('disconnection', username);
            }; break;
        }
    }

    private getClientsList(): string[]{
        var usersList: string[]=[];
        for (const client of this.clients){
            usersList.push(client.getUserName());
        }
        return usersList;
    }
    

    private createAndRunHttpServer(port: number): http.Server {
        const server = http.createServer(function(request, response) {
            response.writeHead(404);
            response.end();
        });
        server.listen(port, function() {
            console.log((new Date()) + ' Server is listening on port '+port);
        });
        return server;
    }

    private addWebSocketServer(httpServer: http.Server): void {
        const webSocketServer = new WebSocketServer({
            httpServer: httpServer,
            autoAcceptConnections: false
        });
        webSocketServer.on('request', request=>this.onWebSocketRequest(request));
    }

    private onWebSocketRequest(request): void {
        const connection = request.accept(null, request.origin);
        const client = new Client(this, connection, this.mail, this.db);
        this.clients.push(client);
    }

    removeClient(client: Client) {
        this.clients.splice(this.clients.indexOf(client), 1);
    }
}
