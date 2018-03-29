import { Component, OnInit } from '@angular/core';
import { InstantMessagingService } from '../instant-messaging.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.css']
})
export class ProfilComponent {

  constructor(private location: Location, private service: InstantMessagingService) { }

  private goBack(): void {
    this.location.back();
  }

}
