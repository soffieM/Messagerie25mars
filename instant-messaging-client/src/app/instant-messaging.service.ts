import { Injectable } from '@angular/core';
import { InstantMessage } from './instant-message';
import { RoutingService } from './routing.service';
import { Discussion } from './discussion';
import { DiscussionsListItem } from './discussions-list-item';
import { DiscussionParticipantsNames } from './discussion-participants-names';
import { DiscussionParticipantsIds } from './discussion-participants-ids';
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
  private contacts: UserIdAndName[] = [];
  private discussionsList: string[]; // liste des numéros de discussion
  private discussionsListName: DiscussionParticipantsNames[] = []; // liste des numéros de discussion + nom des participants
  private discussionsListId: DiscussionParticipantsIds[] = []; // liste des numéros de discussion + id des participants
  private currentDiscussion: Discussion;
  private messages: InstantMessage[] = []; // peut être attribut de currentDiscussion, attention au départ

  public askDiscussion(contactId: string) {
    let nbDiscussions = this.discussionsListId.length;
    if (nbDiscussions === 0) {
      console.log('discussions vide, en créer avec' + contactId);
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
          console.log('discussion pas trouvee, createDiscussion avec ' + contactId);
          this.sendCreateDiscussion(contactId); // crée la discussion
        }
      }
    }
  }

  private onFetchDiscussion(discussion: Discussion) {
    console.log('arrivé dans service onFetchDiscussion, discussion ' + discussion.id);
    this.currentDiscussion = new Discussion (discussion.id, discussion.participants, discussion.history);
    console.log('changé currentDiscussion.id' + this.currentDiscussion.id + 'et participants ' + this.currentDiscussion.participants);
    this.messages = this.currentDiscussion.history;
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
    console.log(this.user);
  }

  private onContactsList(ContactsList: UserIdAndName[]) {
    this.contacts = ContactsList;
  }

  private onDiscussionList(discussionsList: DiscussionsListItem[]) {
    this.discussionsListId = [];
    this.discussionsListName = [];
    console.log('discussionsList obtenu onDiscussion');
    console.log(discussionsList);
    for (let i = 0; i < discussionsList.length; i++) {
      const participantsId: string[] = [];
      const participantsName: string[] = [];
      const disc: DiscussionsListItem = discussionsList[i];
      for (let j = 0; j < disc.participants.length; j++) {
        const userId = disc.participants[j].userId;
        const username: string = disc.participants[j].username;
        participantsId.push(userId);
        participantsName.push(username);
      }
    const discussiontmp: any = discussionsList[i];
    const id: string = discussiontmp.id;
    this.discussionsListId.push({id, participantsId});
    this.discussionsListName.push({id, participantsName});
    }
    console.log('discussionListId devient ');
    console.log(this.discussionsListId);
    console.log('discussionListname devient ' + this.discussionsListName);
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

  /*
  private onOkInvitation(contact: string  ) {
      this.contacts.push(contact);
      console.log(this.contacts);
  }
  */

  /*
  private onContact(contact: string[]) {
      this.contacts.push(contact[1]);
      console.log(this.contacts);
  }
  */

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
 //     case 'okInvitation': this.onOkInvitation(message.data); break;
      case 'removeInvitation': this.removeInvitation(message.data); break;
  //    case 'contact': this.onContact(message.data); break;
      case 'removeContact': this.removeContact(message.data); break
      case 'discussion' : this.onFetchDiscussion(message.data); break;
      case 'ownUser': this.onOwnUser(message.data); break;
      case 'discussionsList': this.onDiscussionList(message.data); break;
      case 'contactsList': this.onContactsList(message.data); break;
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

  public getUserName(): string {
    return this.user.username;
  }

  public getContacts(): UserIdAndName[] {
    return this.contacts;
  }

   public getDiscussionsListName(): DiscussionParticipantsNames[] {
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
/*
  public sendOkInvitation (okInvitation: string ) {
    this.sendMessage('okInvitation', okInvitation);
  }
*/
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

  public sendRemoveContact(contact: string) {
    this.sendMessage('removeContact', contact);
  }

  public removeContact(contact: string) {
    const index = this.invitations.indexOf(contact);
    this.invitations.splice(index, 1);
  }

  public sendAddParticipant(contactId: string) {
    console.log('ajoute à discussion ' + this.currentDiscussion.id + ' lecontact ' + contactId)
    const addParticipant = {id: this.currentDiscussion.id, contact: contactId};
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
