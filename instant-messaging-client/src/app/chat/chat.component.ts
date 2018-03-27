import { Component, OnInit } from '@angular/core';
import { InstantMessagingService } from '../instant-messaging.service';
import { MatToolbarModule, MatInputModule, MatProgressSpinnerModule, MatCardModule } from '@angular/material';
import { MatMenuModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  visibilityInvitation = false;
  visibilityContact = false;
  visibilityDiscussion = false;

  constructor(private service: InstantMessagingService) { }

  ngOnInit() {
  }

  private afficheInvitations(): void {
    this.visibilityInvitation = !this.visibilityInvitation;
  }

  private afficheContacts(): void {
    this.visibilityContact = !this.visibilityContact;
  }

  private afficheDiscussions(): void {
    this.visibilityDiscussion = !this.visibilityDiscussion;
  }


}
