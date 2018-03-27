import {connection as WebSocketConnection} from 'websocket';
import { Server } from "./server";
import { DbModel } from "./dbModel";

export class Client {
    private usernameRegex = /^[a-zA-Z0-9]*$/;
    private username: string = null;
    private userId: string = null;

    public constructor(private server: Server, private connection: WebSocketConnection, private db: DbModel) {
        connection.on('message', (message)=>this.onMessage(message.utf8Data));
        connection.on('close', ()=>server.removeClient(this));
        connection.on('close', ()=>server.broadcastUsersList());
        connection.on('close', ()=>server.broadcastUserConnection('disconnection',this.username));
    }

    private sendMessage(type: string, data: any): void {
        const message = {type: type, data: data};
        this.connection.send(JSON.stringify(message));
    }
   
    public sendUsersList(content: string[]) {
        const users_list = content;
        this.sendMessage('users_list', users_list);
    }

    public sendInstantMessage(content: string, author: string, date: Date) {
        const instantMessage = { content: content, author: author, date: date };
        this.sendMessage('instant_message', instantMessage);
    }

    async sendOwnUser(username: string){
        const userId = this.userId;
        const invitations = 
        await this.db.getContactsOrInvitationsOrDiscussionFromUserCollection('invitations', username);
        const con = 
        await this.db.getContactsOrInvitationsOrDiscussionFromUserCollection('contacts', username);
        const contacts: string[] = [];
        for (let i = 0; i < con.length; i++){
            contacts[i] = con[i].idUser;
            console.log('contact = '+contacts[i])
        }
        const discussions: string[] = await this.db.getContactsOrInvitationsOrDiscussionFromUserCollection('id_discussion', username);
        const dataUser = {userId, username, invitations, contacts, discussions};
        this.sendMessage('ownUser', dataUser);
    }

    async sendDiscussionsList(userId: string){
        const discussions = 
        await this.db.getContactsOrInvitationsOrDiscussionFromUserCollection('id_discussion', this.username);
        const discussionsList: any[] =[];
        for (let i = 0; i < discussions.length; i++){
            const id = discussions[i].id;
            const participants:any[]=[];
            const participantsComplet = await this.db.getParticipants(id);// toute l'info user
            for (let i = 0; i < participantsComplet.length; i++){
                const userId = participantsComplet[i];
                const username = await this.db.getUsername(userId);
                console.log('on ajoute participant = '+ userId +'de nom = '+username + 'discussion = '+id);
                participants.push({userId, username});
            }
            discussionsList.push({id, participants});
        }
        console.log('discussionsList'+ discussionsList)
        this.sendMessage('discussionsList', discussionsList);
    }

    async sendInvitation(dest : string, username: string){
        if (dest===username)return;
        const invitation = [dest, username];
        this.sendMessage('invitation', invitation);
        const usernameInvitations = await this.db.getContactsOrInvitationsOrDiscussionFromUserCollection ('invitations', this.username);
        const id_dest = await this.db.getUserId(dest);

        const b = await this.db.verifyIfExistInContact_Invitation('invitations', username, dest);
        if (b ===0) {
            await this.db.addContactsOrInvitationsInUsersCollection ("invitations", username, dest);
        }
    }

    public sendContact(dest: string , username: string ) {
       const contact = [dest, username];
       this.sendMessage('contact', contact);
    }
  
    public sendUserConnection(connection: string, username: string){
        this.sendMessage(connection, username);
    }

    async onUserLogin(username, password) {
        const i = await this.db.checkIfUserExists(username);
        if (i === 1 ){ 
            const verifyPassword = await this.db.verifyPasswordWithHashCode (username, password);  
            if (!verifyPassword){
                this.sendMessage('login', 'Mot de passe incorrect');
                return;
            } else {
            this.username = username;
            this.sendMessage('login', 'ok');
            this.userId = await this.db.getUserId(username);
            console.log("userid " + this.userId);
            this.sendOwnUser(username);
            this.sendDiscussionsList(this.userId);

            this.server.broadcastUsersList();
            this.server.broadcastUserConnection('connection', username); 
            }
        } else {
            this.sendMessage('login', 'Login non reconnu');
            return;
        }     
        
    }

    async onUserSubscription(username, password, mail) {
        const i = await this.db.checkIfMailExists(mail);
        const j = await this.db.checkIfUserExists(username); 
        if (i === 1 ){ 
            this.sendMessage('subscription', 'Compte déjà existant');
            return;
        } else if (j === 1 ){
            this.sendMessage('subscription', 'Pseudo déjà utilisé');
            return;
        } else {
            this.db.addUser(username, password, mail);   
            this.sendMessage('subscription', 'ok');
        }
    }

    private onInstantMessage(discussionId: string, content: string, participants: string[]): void {
        if (!(typeof 'content' === 'string')) return;
        if (this.username==null) return;
        this.server.broadcastInstantMessage(discussionId, content, this.username, participants);
    }

    private onInvitation(dest){
        this.server.broadcastInvitation(dest, this.username);
    }

    async removeInvitation(invitation){
        this.sendMessage('removeInvitation', invitation);
        await this.db.deleteInvitationsOrContacts ('invitation', invitation, this.username);
    }

    async onOkInvitation(contact){
        const okInvitation = contact;
        this.sendMessage( 'okInvitation', okInvitation);
    }

    async onContact(dest) {
        const b = await this.db.verifyIfExistInContact_Invitation('contacts', this.username, dest);
        if (b === 0){
            await this.db.addContactsOrInvitationsInUsersCollection ("contacts", this.username, dest);
            await this.db.addContactsOrInvitationsInUsersCollection ("contacts", dest, this.username);         
        }
        this.server.broadcastContact(dest, this.username);
    }

    async onCreateDiscussion(contactId: string) {
        console.log('client.ts on entre dans la fonction onCreateDiscussion avec ' + this.username + '' + contactId);
        const id = await this.db.createDiscussion(this.userId, contactId);
        
        this.onFetchDiscussion(id);
        console.log('a chargé la disc ' + id +'; client.ts onCreateDiscussion ' + contactId + ' terminé' );
        await this.db.addDiscussionIdToUser(this.userId, id);
        console.log('a ajouté la discussion '  + id + ' à ' + this.userId)
        this.server.broadcastCreateDiscussion(contactId, id);
        console.log('a ajouté la discussion '  + id + ' à ' + contactId);
        this.sendDiscussionsList(this.userId);
    }

    async onFetchDiscussion(id: string) {
        console.log('client.ts on entre dans la fonction onFetchDiscussion ' + id );
        const participants = await this.db.getParticipants(id);
        const history = await this.db.getHistory(id);        
        const discussion = {id, participants, history};
        this.sendMessage('discussion', discussion);
    }

    async onAddParticipant(id: string, contactId: string) {
        console.log('client.ts ajout participant a la discussion ' + id);
        await this.db.addDiscussionIdToUser(contactId, id);
        await this.db.addParticipantInDiscussion(id, contactId);
        this.server.broadcastFetchDiscussion(id);
    }

    async onQuitDiscussion(id: string) {
        console.log(this.userId + 'quitte discussion' + id);
        await this.db.deleteParticipantFromDiscussion(this.userId, id);
        await this.db.deleteDiscussionFromUser(id, this.userId)
        this.server.broadcastFetchDiscussion(id);
    }

    private onMessage(utf8Data: string): void {
        const message = JSON.parse(utf8Data);
        switch (message.type) {
            case 'instant_message': this.onInstantMessage(message.data.discussionId, message.data.content, message.data.participants); break;
            case 'userSubscription': this.onUserSubscription(message.data.username, message.data.password, message.data.mail); break;
            case 'userLogin': this.onUserLogin(message.data.username, message.data.password); break;
            case 'invitation': this.onInvitation(message.data); break;
            case 'okInvitation': this.onOkInvitation(message.data); break;
            case 'removeInvitation': this.removeInvitation(message.data); break;
            case 'contact': this.onContact(message.data); break;
            case 'createDiscussion': this.onCreateDiscussion(message.data); break;
            case 'discussion': this.onFetchDiscussion(message.data); break;
            case 'addParticipant': this.onAddParticipant(message.data.discussionId, message.data.contactId); break;  
            case 'quitDiscussion': this.onQuitDiscussion(message.data); break;  
       }
    }

    public getUserName(){
        return this.username;
    }

    public getUserId(){
        return this.userId;
    }
}

