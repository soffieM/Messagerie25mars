import { Component, Input } from '@angular/core';
import { InstantMessage } from '../instant-message';
import { InstantMessagingService } from '../instant-messaging.service';
import { MatToolbarModule, MatInputModule, MatProgressSpinnerModule, MatCardModule } from '@angular/material';
import { MatMenuModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { Directive } from '@angular/core';


@Component({
  selector: 'app-instant-message',
  templateUrl: './instant-message.component.html',
  styleUrls: ['./instant-message.component.css']
})

export class InstantMessageComponent {
  @Input()
  message: InstantMessage;


  public constructor(private service: InstantMessagingService) {};

  private emis(): boolean {
    if (this.message.author === this.service.getUserName()) {
      return true;
    }
    return false;
  }

  private messAuto(): boolean {
    if (this.message.author === 'Message Automatique') {
      return true;
    }
    return false;
  }


}
