import { Component } from '@angular/core';
import { InstantMessagingService } from 'app/instant-messaging.service';
import { Location } from '@angular/common';
import { RoutingService } from '../routing.service';

@Component({
  selector: 'app-subscribe-form',
  templateUrl: './subscribe-form.component.html',
  styleUrls: ['./subscribe-form.component.css']
})
export class SubscribeFormComponent {

  private username = '';
  private password = '';
  private mail = '';

  constructor(private service: InstantMessagingService, private routing: RoutingService) { }

  onSubmit() {
    console.log(this.username + this.password + this.mail);
    this.send();
  }

  private send(): void {
    this.service.sendSubscription(this.username, this.password, this.mail);
  }

  private goBack(): void {
    this.routing.goLogin();
  }
}
