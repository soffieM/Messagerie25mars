import { Component, OnInit } from '@angular/core';
import { InstantMessagingService } from '../instant-messaging.service';

@Component({
  selector: 'app-invitation-list',
  templateUrl: './invitation-list.component.html',
  styleUrls: ['./invitation-list.component.css']
})
export class InvitationListComponent {
  constructor(private service: InstantMessagingService) { }
}



