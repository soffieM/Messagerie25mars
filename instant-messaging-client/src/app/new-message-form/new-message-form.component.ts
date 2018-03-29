import { Component, EventEmitter, Output } from '@angular/core';
import { InstantMessage } from '../instant-message';
import { InstantMessagingService } from '../instant-messaging.service';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-new-message-form',
  templateUrl: './new-message-form.component.html',
  styleUrls: ['./new-message-form.component.css']
})
export class NewMessageFormComponent {
  private content = '';

  public constructor(private service: InstantMessagingService) {}

  private send(): void {
    this.service.sendInstantMessage(this.content);
    this.content = '';
  }
}
