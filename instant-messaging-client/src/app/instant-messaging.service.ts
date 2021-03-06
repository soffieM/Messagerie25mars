import { Injectable } from '@angular/core';
import { InstantMessage } from './instant-message';
import { RoutingService } from './routing.service';
import { Discussion } from './discussion';
import { DiscussionsListItem } from './discussions-list-item';
import { DiscussionParticipantsNames } from './discussion-participants-names';
import { DiscussionParticipantsIds } from './discussion-participants-ids';
import { UserIdAndName } from './user-id-and-name';


@Injectable()
export class InstantMessagingService {
  private user: UserIdAndName;
  private users: string [] = []; // liste des utilisateurs connectés
  private socket: WebSocket;
  private logged: boolean;
  private errorMessage: string;
  private invitations: string[] = [];
  private invitationsList: string [] = [];
  private contacts: UserIdAndName[] = [];
  // private discussionsList: string[]; // liste des numéros de discussion
  private discussionsListName: DiscussionParticipantsNames[] = []; // liste des numéros de discussion + nom des participants
  private discussionsListId: DiscussionParticipantsIds[] = []; // liste des numéros de discussion + id des participants
  private currentDiscussion: Discussion;
  private messages: InstantMessage[] = []; // peut être attribut de currentDiscussion, attention au départ
  private welcome: Discussion = {id: '0', participants: [],
  history: [new InstantMessage('Sélectionnez un contact ou une discussion', null, null)]};

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

  private onOwnUser(user: UserIdAndName) {
    this.user = user;
    this.routing.goChat();
    console.log(this.user);
  }

  private onContactsList(ContactsList: UserIdAndName[]) {
    this.contacts = ContactsList;
  }

  private onInvitationsList(invitationsList: string []) {
    this.invitationsList = invitationsList;
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
    console.log('onConnection.....service = ' + this.isConnectedUser(username));
    // this.messages.push(new InstantMessage(username + ' vient de rejoindre la conversation', 'Message Automatique', new Date()));
  }

  private onDisconnection(username: string) {
    console.log('onDisconnection.....service = ' + this.users);
    const index = this.users.indexOf(username);
    this.users.splice(index, 1);
    console.log('onDisconnection.....service 2 = ' + this.users);
    // this.messages.push(new InstantMessage(username + ' vient de quitter la conversation', 'Message Automatique', new Date()));
  }

  public isConnectedUser(username: string): boolean {
    return this.users.includes(username);
  }


  private onInvitation(invitation: string[]) {
    console.log(this.invitations);
     this.invitations.push(invitation[1]);
     console.log(this.invitations);
 }

 private onLogin(state: string) {
  if (state === 'ok') {
    this.logged = true;
    } else {
    this.errorMessage = state;
    this.routing.goError();
  }
}

private onNewUsername(username: string) {
  this.user.username = username;
  this.routing.goChat();
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

private onNewUsernameAlreadyUsed(errorMessage: string) {
    this.errorMessage = errorMessage;
    this.routing.goError();
}

private onStatePassword(state: string) {
  if ( state === 'Mot de passe modifié') {
    this.routing.goChat();
  } else {
    this.errorMessage = state;
    this.routing.goError();
  }
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
      case 'discussion' : this.onFetchDiscussion(message.data); break;
      case 'ownUser': this.onOwnUser(message.data); break;
      case 'discussionsList': this.onDiscussionList(message.data); break;
      case 'contactsList': this.onContactsList(message.data); break;
      case 'invitationsList': this.onInvitationsList(message.data); break;
      case 'onNewUsername': this.onNewUsername(message.data); break;
      case 'newUserNameAlreadyUsed': this.onNewUsernameAlreadyUsed(message.data); break;
      case 'statePassword': this.onStatePassword(message.data); break;
    }
  }

  public constructor(private routing: RoutingService) {
    this.logged = false;
    this.socket = new WebSocket('ws:/localhost:4201');
    this.socket.onmessage = (event: MessageEvent) => this.onMessage(event.data);
    this.currentDiscussion = this.welcome;

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
    return this.invitationsList;
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

  public getCurrentDiscussionParticipantsNames(): string[] {
    for (const list of this.discussionsListName) {
      if (list.id === this.currentDiscussion.id) {
        return list.participantsName;
      }
    }
    return ['Sélectionnez un contact ou une discussion'];
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
// encore utile ?
  public removeContact(contact: string) {
    const index = this.invitations.indexOf(contact);
    this.invitations.splice(index, 1);
  }

  public sendAddParticipant(contactId: string) {
    console.log('ajoute à discussion ' + this.currentDiscussion.id + ' lecontact ' + contactId)
    const addParticipant = {id: this.currentDiscussion.id, contactId: contactId};
    this.sendMessage('addParticipant', addParticipant);
  }

  public sendQuitDiscussion(id: string) {
    this.sendMessage('quitDiscussion', id);
    this.currentDiscussion = this.welcome;
  }

  public isLogged(): boolean {
    return (this.logged);
  }

  public unLog() {
    this.logged = false;
    this.routing.goLogin();
    this.sendMessage('disconnection', this.user.username);
  }

  public sendLogin(username: string, password: string) {
    this.sendMessage('userLogin', {username: username, password: password});
  }

  public sendSubscription(username: string, password: string, mail: string) {
    this.sendMessage('userSubscription', {username: username, password: password, mail: mail});
  }

  public sendMail(mail: string) {
    this.sendMessage('forgottenpassword', mail);
  }

  public sendNewUsername(newUsername: string) {
    this.sendMessage('newUsername', {oldUsername: this.user.username, newUsername: newUsername});
  }

  public sendNewPassword(oldPassword: string, newPassword: string) {
    this.sendMessage('newPassword', {username: this.user.username, oldPassword: oldPassword, newPassword: newPassword});
  }
}
