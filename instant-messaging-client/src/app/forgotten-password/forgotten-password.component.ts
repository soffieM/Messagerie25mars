import { Component, OnInit } from '@angular/core';
import { InstantMessagingService } from '../instant-messaging.service'
import { RoutingService } from '../routing.service';

@Component({
  selector: 'app-forgotten-password',
  templateUrl: './forgotten-password.component.html',
  styleUrls: ['./forgotten-password.component.css']
})
export class ForgottenPasswordComponent {
  private mail = '';

  constructor(private service: InstantMessagingService, private routing: RoutingService) { }

  private send(): void {
    this.service.sendMail(this.mail);
    console.log('mail envoyé');
    this.routing.goLogin();
  }

  private goBack(): void {
    this.routing.goLogin();
  }
}

