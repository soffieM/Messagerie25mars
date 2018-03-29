import { Component, Input } from '@angular/core';
import { InstantMessagingService } from 'app/instant-messaging.service';
import { MatListModule } from '@angular/material/list';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

@Component({
  selector: 'app-instant-invitation',
  templateUrl: './instant-invitation.component.html',
  styleUrls: ['./instant-invitation.component.css']
})
export class InstantInvitationComponent  {
  @Input()
  invitation: string;
  constructor(private service: InstantMessagingService) { }

  private remove(): void {
    this.service.sendRemoveInvitation(this.invitation);
  }

  private onContact ():  void {
//    this.service.sendOkInvitation(this.invitation);
    this.service.sendRemoveInvitation(this.invitation);
    this.service.sendContact(this.invitation);
    }
  }
