import { Component, OnInit } from '@angular/core';
import { InstantMessagingService } from '../instant-messaging.service';

@Component({
  selector: 'app-invitation-form',
  templateUrl: './invitation-form.component.html',
  styleUrls: ['./invitation-form.component.css']
})
export class InvitationFormComponent {

private invitation = '';

constructor(private service: InstantMessagingService) { }

private send(): void {
  this.service.sendInvitation(this.invitation);
  this.invitation = '';
}
}

