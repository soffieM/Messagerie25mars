import { Component, OnInit } from '@angular/core';
import { InstantMessagingService } from '../instant-messaging.service';
import { Location } from '@angular/common';
import { RoutingService } from '../routing.service';

@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.css']
})
export class ProfilComponent {

  private newUsername = '';
  private oldPassword = '';
  private newPassword = '';

  constructor(private routing: RoutingService, private service: InstantMessagingService) { }

  private changeUsername(): void {
    this.service.sendNewUsername(this.newUsername);
  }

  private changePassword(): void {
    this.service.sendNewPassword(this.oldPassword, this.newPassword);
  }

  private goBack(): void {
    this.routing.goChat();
  }

}
