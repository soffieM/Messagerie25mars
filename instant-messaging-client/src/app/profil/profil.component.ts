import { Component, OnInit } from '@angular/core';
import { InstantMessagingService } from '../instant-messaging.service';
import { MatToolbarModule, MatInputModule, MatProgressSpinnerModule, MatCardModule } from '@angular/material';
import { MatMenuModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Location } from '@angular/common';

@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.css']
})
export class ProfilComponent {

  fileToUpload: File = null;

  constructor(private location: Location) { }

  private goBack(): void {
    this.location.back();
  }

  handleFileInput(files: FileList) {
    this.fileToUpload = files.item(0);
    console.log(files.item(0).name);
}

}
