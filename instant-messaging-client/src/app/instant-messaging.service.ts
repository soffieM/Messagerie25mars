import { Injectable } from '@angular/core';
import { InstantMessage } from './instant-message';
import { RoutingService } from './routing.service';
import { Discussion } from './discussion';
import { DiscussionsListItem } from './discussions-list-item';
import { DiscussionsListItemName } from './discussions-list-item-name';
import { DiscussionsListIds } from './discussions-list-ids';
import { User } from './user';
import { UserIdAndName } from './user-id-and-name';


@Injectable()
export class InstantMessagingService {
  private user: User;
  private users: string [] = []; // liste des utilisateurs connectés
  private socket: WebSocket;
  private logged: boolean;
  private errorMessage: string;
  private invitations: string[] = [];
  private contacts: string [] = [];
  private discussionsList: string[]; // liste des numéros de discussion
  private discussionsListName: DiscussionsListItemName[] = []; // liste des numéros de discussion + nom des participants
  private discussionsComplete: DiscussionsListItem[]; // reçue du serveur
  private discussionsListId: DiscussionsListIds[] = []; // liste des numéros de discussion + id des participants
  private currentDiscussion: Discussion;
  // private participants: string[];
  private messages: InstantMessage[] = [];

  public askDiscussion(contactId: string) {
    let nbDiscussions = this.discussionsList.length;
    if (nbDiscussions === 0) {
      console.log('discussion vide à créer avec' + contactId);
      this.sendCreateDiscussion(contactId);
    } else {
      for (const discussion of this.discussionsListId) {
        console.log(discussion);
        if (discussion.participantsId.length === 2 && !(discussion.participantsId.indexOf(contactId) === -1)) {
          console.log('discussion trouvee');
          this.sendFetchDiscussion(discussion.id); //  récupère la première discussion correspondante
          break;
        }
        nbDiscussions--;
        if (nbDiscussions === 0) {
          console.log('createDiscussion avec ' + contactId);
          this.sendCreateDiscussion(contactId); // crée la discussion
        }
      }
    }
  }

  private onFetchDiscussion(discussion: Discussion) {
    console.log('arrivé dans service onFetchDiscussion, discussion ' + discussion.id);
    this.currentDiscussion = new Discussion (discussion.id, discussion.participants, discussion.history);
    console.log('changé currentDiscussion.id' + this.currentDiscussion.id);
    console.log('participants ' + this.currentDiscussion.participants);
    this.messages = this.currentDiscussion.history; // à supprimer après refactoring
  }

  private onInstantMessage(message: InstantMessage) {
    this.messages.push(message);
    console.log('nouveau message');
  }

  private onUserStatusChange(userslist: string []) {
    this.users = userslist;
    console.log(this.users);
  }

  private onOwnUser(user: User) {
    this.user = user;
    this.invitations = user.invitations;
    this.contacts = user.contacts;
    this.discussionsList = [];
    console.log(this.user);
  }

  private onDiscussionList(discussionsList: DiscussionsListItem[]) {
    this.discussionsComplete = discussionsList;
   // const discussions: DiscussionsListItem[] = [];
    console.log(this.discussionsComplete);
    for (let i = 0; i < this.discussionsComplete.length; i++) {
      const participantsId: string[] = [];
      const participantsName: string[] = [];
      const disc: DiscussionsListItem = this.discussionsComplete[i];
      for (let j = 0; j < disc.participants.length; j++) {
        const userId = disc.participants[j].userId;
        console.log(userId);
        const username: string = disc.participants[j].username;
        console.log(username);
        participantsName.push(username);
        console.log(participantsName);
        participantsId.push(userId);
      }
    // console.log(this.discussionsComplete['0'].discussionId);

    const discussiontmp: any = this.discussionsComplete[i];
    const id: string = discussiontmp.id;
    // console.log(discussiontest.discussionId);
    // console.log(this.discussionsComplete['0'].discussionId);
    console.log(id);
    console.log(this.discussionsListId);
    this.discussionsListId.push({id, participantsId});
    console.log(participantsName);
    console.log(this.discussionsListName);
    this.discussionsListName.push({id, participantsName});
   }
  }

  private onConnection(username: string) {
    this.messages.push(new InstantMessage(username + ' vient de rejoindre la conversation', 'Message Automatique', new Date()));
  }

  private onDisconnection(username: string) {
    this.messages.push(new InstantMessage(username + ' vient de quitter la conversation', 'Message Automatique', new Date()));
  }

  private onInvitation(invitation: string[]) {
      this.invitations.push(invitation[1]);
      console.log(this.invitations);
  }

  private onOkInvitation(contact: string  ) {
      this.contacts.push(contact);
      console.log(this.contacts);
  }

  private onContact(contact: string[]) {
      this.contacts.push(contact[1]);
      console.log(this.contacts);
  }

  private onMessage(data: string) {
    const message = JSON.parse(data);
    switch (message.type) {
      case 'instant_message': this.onInstantMessage(message.data); break;
      case 'login': this.onLogin(message.data); break;
      case 'users_list': this.onUserStatusChange(message.data); break;
      case 'connection': this.onConnection(message.data); break;
      case 'disconnection': this.onDisconnection(message.data); break;
      case 'subscription': this.onSubscription(message.data); break;
      case 'invitation': this.onInvitation(message.data); break;
      case 'okInvitation': this.onOkInvitation(message.data); break;
      case 'removeInvitation': this.removeInvitation(message.data); break;
      case 'contact': this.onContact(message.data); break;
      case 'discussion' : this.onFetchDiscussion(message.data); break;
      case 'ownUser': this.onOwnUser(message.data); break;
      case 'discussionsList': this.onDiscussionList(message.data); break;
    }
  }

  public constructor(private routing: RoutingService) {
    this.logged = false;
    this.socket = new WebSocket('ws:/localhost:4201');
    this.socket.onmessage = (event: MessageEvent) => this.onMessage(event.data);
  }

  public removeInvitation(invitation: string) {
    const index = this.invitations.indexOf(invitation);
    this.invitations.splice(index, 1);
  }

  public getMessages(): InstantMessage[] {
    return this.messages;
  }

  public getUsers(): string[] {
    return this.users;
  }

  public getErrorMessage(): string {
    return this.errorMessage;
  }

  public getInvitations(): string[] {
    return this.invitations;
  }

  public getContacts(): string[] {
    return this.contacts;
  }

   public getDiscussionsListName(): DiscussionsListItemName[] {
    return this.discussionsListName;
  }

  public sendMessage(type: string, data: any) {
    const message = {type: type, data: data};
    this.socket.send(JSON.stringify(message));
  }

  public sendInstantMessage(content: string) {
    console.log('service-sendInstantMessage discussionId : ' + this.currentDiscussion.id
      + ' content : ' + content + ' participants : ' + this.currentDiscussion.participants);
    const privateMessage = {discussionId : this.currentDiscussion.id,
      content : content, participants : this.currentDiscussion.participants};
    this.sendMessage('instant_message', privateMessage);
  }

  public sendInvitation(invitation: string) {
    this.sendMessage('invitation', invitation);
  }

  public sendRemoveInvitation(invitation: string) {
    this.sendMessage('removeInvitation', invitation);
  }

  public sendOkInvitation (okInvitation: string ) {
    this.sendMessage('okInvitation', okInvitation);
  }

  public sendContact(contact: string) {
    this.sendMessage('contact', contact);
  }

  private sendCreateDiscussion(contact: string) {
    this.sendMessage('createDiscussion', contact);
  }

  public sendFetchDiscussion(id: string) {
    console.log('sendFetchDiscussion' + id);
    this.sendMessage('discussion', id);
  }

  public sendAddParticipant(contact: string) {
    const addParticipant = {discussionId: this.currentDiscussion.id, contact: contact};
    this.sendMessage('addParticipant', addParticipant);
  }

  public sendQuitDiscussion(id: string) {
    this.sendMessage('quitDiscussion', id);
  }

  private onLogin(state: string) {
    if (state === 'ok') {
      this.logged = true;
      this.routing.goChat();
    } else {
      this.errorMessage = state;
      this.routing.goError();
    }
  }

  private onSubscription(state: string) {
    if ( state === 'ok') {
      this.routing.goLogin();
    } else if (state === 'Pseudo déjà utilisé') {
      this.errorMessage = state;
      this.routing.goError();
    } else if (state === 'Compte déjà existant') {
      this.errorMessage = state;
      this.routing.goError();
    } else {
      this.routing.goError();
    }
  }

  public isLogged(): boolean {
    return (this.logged);
  }

  public sendLogin(username: string, password: string) {
    this.sendMessage('userLogin', {username: username, password: password});
  }

  public sendSubscription(username: string, password: string, mail: string) {
    this.sendMessage('userSubscription', {username: username, password: password, mail: mail});
  }
}
