import { Component, OnInit, Input } from '@angular/core';
import { InstantMessagingService } from '../instant-messaging.service';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.css']
})
export class ErrorComponent {
  constructor(private service: InstantMessagingService) { }
}

