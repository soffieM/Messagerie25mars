import { Component, Input } from '@angular/core';
import { InstantMessagingService } from '../instant-messaging.service';
import { DiscussionsListItem } from '../discussions-list-item';
import { MatListModule } from '@angular/material/list';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { UserIdAndName } from '../user-id-and-name';

@Component({
  selector: 'app-contact-list',
  templateUrl: './contact-list.component.html',
  styleUrls: ['./contact-list.component.css']
})
export class ContactListComponent {
  constructor(private service: InstantMessagingService) { }

  private onSelect(contact: UserIdAndName) {
    this.service.askDiscussion(contact.userId);
  }

  private addParticipant(contactId: string) {
    console.log('poubelle' + contactId);
    this.service.sendAddParticipant(contactId);
  }
}
