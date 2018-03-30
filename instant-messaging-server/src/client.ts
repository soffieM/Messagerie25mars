import {connection as WebSocketConnection} from 'websocket';
import { Server } from "./server";
import { DbModel } from "./dbModel";
import { Mail } from "./sendmail";
 
export class Client {
    private usernameRegex = /^[a-zA-Z0-9]*$/;
    private username: string = null;
    private userId: string = null;

    public constructor(private server: Server, private connection: WebSocketConnection,  private mail:Mail, private db: DbModel) {
        connection.on('message', (message)=>this.onMessage(message.utf8Data));
        connection.on('close', ()=>server.removeClient(this));
        connection.on('close', ()=>server.broadcastUsersList());
        connection.on('close', ()=>server.broadcastUserConnection('disconnection',this.username));
    }

    private sendMessage(type: string, data: any): void {
        const message = {type: type, data: data};
        this.connection.send(JSON.stringify(message));
    }

    public sendInstantMessage(content: string, author: string, date: Date) {
        const instantMessage = { content: content, author: author, date: date };
        this.sendMessage('instant_message', instantMessage);
    }

    public sendUsersList(content: string[]) {
        const users_list = content;
        this.sendMessage('users_list', users_list);
    }

    async sendOwnUser(){
        const userId = this.userId;
        const username = this.username;
        const dataUser = {userId, username};
        this.sendMessage('ownUser', dataUser);
        await this.sendDiscussionsList(); // redondant avec onUserLogin
        await this.sendContactsList(); // redondant avec onUserLogin
    }

    async sendDiscussionsList(){
        const discussions = 
        await this.db.getElementsFromUser('id_discussion', this.username);
        const discussionsList: any[] =[];
        for (let i = 0; i < discussions.length; i++){
            const id = discussions[i].id;
            const participants:any[]=[];
            const participantsComplet = await this.db.getParticipants(id);// toute l'info user
            for (let i = 0; i < participantsComplet.length; i++){
                const userId = participantsComplet[i];
                if (userId != null) {  // RUSTINE
                    const username = await this.db.getUsername(userId);
                    console.log('on ajoute participant = '+ userId +' de nom = '+username + ' discussion = '+id);
                    participants.push({userId, username});
                }
            }
            discussionsList.push({id, participants});
        }
        console.log('discussionsList'+ discussionsList);
        this.sendMessage('discussionsList', discussionsList);
    }

    async sendContactsList(){
        const contacts = 
        await this.db.getElementsFromUser('contacts', this.username);
        const contactsList: any[] =[];
        for (let i = 0; i < contacts.length; i++){
            const userId = contacts[i].idUser;
            const username = await this.db.getUsername(userId);
            contactsList.push({userId, username});
        }
            console.log('contactsList'+ contactsList)
        this.sendMessage('contactsList', contactsList);
    }

    async sendInvitationsList(){
        const invitations = 
        await this.db.getElementsFromUser('invitations', this.username);
        const invitationsList: any[] =[];
        for (let i = 0; i < invitations.length; i++){
            const userId = invitations[i].idUser;
            console.log("premier id "+userId);
            const username = await this.db.getUsername(userId);
            console.log("premier nom "+username);
            invitationsList.push(username);
            console.log(username);
        }
            console.log('invitationsList'+ invitationsList)
        this.sendMessage('invitationsList', invitationsList);
    }

    async sendInvitation(dest : string, username: string){
        const invitation = [dest, username];
        this.sendMessage('invitation', invitation); 
        console.log("sendinvitation "+invitation);
    }

    public sendContact(contact: any) {
       this.sendMessage('contact', contact);
    }
  
    public sendUserConnection(connection: string, username: string){
        this.sendMessage(connection, username);
    }

    async removeInvitation(invitation){
        await this.db.deleteInvitationsOrContacts ('invitation',this.username , invitation);
        this.sendInvitationsList();
    }

    async removeContact(contact){
        this.sendMessage('removeContact', contact);
        await this.db.deleteInvitationsOrContacts ('contacts', contact, this.username);
        await this.db.deleteInvitationsOrContacts ('contacts', this.username, contact);
    }

    private onMessage(utf8Data: string): void {
        const message = JSON.parse(utf8Data);
        switch (message.type) {
            case 'instant_message': this.onInstantMessage(message.data.discussionId, message.data.content, message.data.participants); break;
            case 'userSubscription': this.onUserSubscription(message.data.username, message.data.password, message.data.mail); break;
            case 'userLogin': this.onUserLogin(message.data.username, message.data.password); break;
            case 'invitation': this.onInvitation(message.data); break;
            case 'removeInvitation': this.removeInvitation(message.data); break;
            case 'contact': this.onContact(message.data); break;
            case 'createDiscussion': this.onCreateDiscussion(message.data); break;
            case 'discussion': this.onFetchDiscussion(message.data); break;
            case 'addParticipant': this.onAddParticipant(message.data.id, message.data.contactId); break;  
            case 'quitDiscussion': this.onQuitDiscussion(message.data); break;
            case 'removeContact': this.removeContact(message.data); break;
            case 'forgottenpassword': this.onPasswordForgotten(message.data); break;
       }
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
            console.log('userid' + this.userId);
            this.sendOwnUser();
            this.sendDiscussionsList();
            this.sendContactsList();
            this.sendInvitationsList();
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

    async onPasswordForgotten(mail) {
        console.log(mail);
        const i = await this.db.checkIfMailExists(mail);
        console.log(i);
        if (i === 1 ){ 
            this.mail.sendMail(mail);
            console.log("appel méthode envoi mail");
            return; 
        } else {
            this.sendMessage('passwordforgotten', 'Adresse mail non reconnue');
            return;
        }     
    }

    private onInstantMessage(discussionId: string, content: string, participants: string[]): void {
        if (!(typeof 'content' === 'string')) return;
        if (this.username==null) return;
        this.server.broadcastInstantMessage(discussionId, content, this.username, participants);
    }

    async  onInvitation(dest){
        if (dest === this.username)return;
           //const usernameInvitations = await this.db.getElementsFromUser ('invitations', this.username);
           const id_dest = await this.db.getUserId(dest);
   
           const b = await this.db.verifyIfExistInContact_Invitation('invitations',  dest, this.username);
           const c = await this.db.verifyIfExistInContact_Invitation('contacts', this.username, dest);
           if (b ===0 && c ===0) {
               await this.db.addContactsOrInvitationsInUsersCollection ("invitations", dest , this.username);
           }
           console.log('invitation dest ='+dest);
           console.log('invitation username ='+this.username);
           this.server.sendFriendInvitationsList(dest);
    }

    

    async onContact(friend) {
        const b = await this.db.verifyIfExistInContact_Invitation('contacts', this.username, friend);
        if (b === 0){
            await this.db.addContactsOrInvitationsInUsersCollection ("contacts", this.username, friend);
            await this.db.addContactsOrInvitationsInUsersCollection ("contacts", friend, this.username);       
        }
        this.sendContactsList();
        this.server.sendFriendContactsList(friend);
    }

    async onCreateDiscussion(contactId: string) {
        console.log('client.ts on entre dans la fonction onCreateDiscussion avec ' + this.username + '' + contactId);
        const id = await this.db.createDiscussion(this.userId, contactId);
        this.onFetchDiscussion(id);
        console.log('a chargé la disc ' + id +'; client.ts onCreateDiscussion ' + contactId + ' terminé' );
        this.sendDiscussionsList();
        this.server.broadcastCreateDiscussion(contactId, id);
        await this.db.addDiscussionIdToUser(this.userId, id);
    }

    async onFetchDiscussion(id: string) {
        console.log('client.ts on entre dans la fonction onFetchDiscussion ' + id );
        const participants = await this.db.getParticipants(id);
        const history = await this.db.getHistory(id);        
        const discussion = {id, participants, history};
        this.sendMessage('discussion', discussion);
    }

    async onAddParticipant(id: string, contactId: string) {
        console.log('client.ts ajout participant '+ contactId +' a la discussion ' + id);
        await this.db.addDiscussionIdToUser(contactId, id);
        await this.db.addParticipantInDiscussion(id, contactId);
        this.sendDiscussionsList();
        this.server.broadcastUpdateDiscussionList(id);
    }

    async onQuitDiscussion(id: string) {
        console.log(this.userId + 'quitte discussion' + id);
        await this.db.deleteParticipantFromDiscussion(id, this.userId);
        await this.db.deleteDiscussionFromUser(this.userId, id);
        this.sendDiscussionsList();
        this.server.broadcastUpdateDiscussionList(id);
    }

    public getUserName(){
        return this.username;
    }

    public getUserId(){
        return this.userId;
    }
}

