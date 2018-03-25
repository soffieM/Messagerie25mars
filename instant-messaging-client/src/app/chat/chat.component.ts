import { Component, OnInit } from '@angular/core';
import { InstantMessagingService } from '../instant-messaging.service';
import { MatToolbarModule, MatInputModule, MatProgressSpinnerModule, MatCardModule } from '@angular/material';
import { MatMenuModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  constructor(private service: InstantMessagingService) { }

  ngOnInit() {
  }

}
