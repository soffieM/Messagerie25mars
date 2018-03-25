import { Component, Input } from '@angular/core';
import { InstantMessagingService } from '../instant-messaging.service';
import { DiscussionsListItem } from '../discussions-list-item';

@Component({
  selector: 'app-contact-list',
  templateUrl: './contact-list.component.html',
  styleUrls: ['./contact-list.component.css']
})
export class ContactListComponent {
  constructor(private service: InstantMessagingService) { }

  private onSelect(contact: string) {
    this.service.askDiscussion(contact);
    console.log('clique sur ' + contact);
  }

  private addParticipant(contact: string) {
    this.service.sendAddParticipant(contact);
  }

}
