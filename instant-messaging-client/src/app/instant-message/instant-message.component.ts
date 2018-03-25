import { Component, Input } from '@angular/core';
import { InstantMessage } from '../instant-message';

@Component({
  selector: 'app-instant-message',
  templateUrl: './instant-message.component.html',
  styleUrls: ['./instant-message.component.css']
})
export class InstantMessageComponent {
  @Input()
  message: InstantMessage;
}
