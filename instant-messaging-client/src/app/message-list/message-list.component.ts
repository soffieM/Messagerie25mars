import { Component, Input } from '@angular/core';
import { InstantMessage } from '../instant-message';
import { InstantMessagingService } from '../instant-messaging.service';

@Component({
  selector: 'app-message-list',
  templateUrl: './message-list.component.html',
  styleUrls: ['./message-list.component.css']
})

export class MessageListComponent {
  constructor(private service: InstantMessagingService) { }
}
