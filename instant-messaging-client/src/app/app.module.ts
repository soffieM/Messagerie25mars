import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { MatToolbarModule, MatInputModule, MatProgressSpinnerModule, MatCardModule } from '@angular/material';
import { MatIconModule} from '@angular/material/icon';
import { MatMenuModule } from '@angular/material';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatDividerModule} from '@angular/material/divider';

import { AppComponent } from './app.component';
import { MessageListComponent } from './message-list/message-list.component';
import { InstantMessageComponent } from './instant-message/instant-message.component';
import { NewMessageFormComponent } from './new-message-form/new-message-form.component';
import { InstantMessagingService } from './instant-messaging.service';
import { RoutingService } from './routing.service';
import { LoginFormComponent } from './login-form/login-form.component';
import { AutoScrollDirective } from './auto-scroll.directive';
import { ConnectedPeopleListComponent } from './connected-people-list/connected-people-list.component';
import { AppRoutingModule } from './app-routing.module';
import { ChatComponent } from './chat/chat.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { SubscribeFormComponent } from './subscribe-form/subscribe-form.component';
import { ErrorComponent } from './error/error.component';
import { ErrorMessageComponent } from './error-message/error-message.component';
import { InstantInvitationComponent } from './instant-invitation/instant-invitation.component';
import { InvitationListComponent } from './invitation-list/invitation-list.component';
import { InvitationFormComponent } from './invitation-form/invitation-form.component';
import { ContactListComponent } from './contact-list/contact-list.component';
import { ContactComponent } from './contact/contact.component';
import { ProfilComponent } from './profil/profil.component';
import { DiscussionsListComponent } from './discussions-list/discussions-list.component';
import { AboutComponent } from './about/about.component';

@NgModule({
  declarations: [
    AppComponent,
    MessageListComponent,
    InstantMessageComponent,
    NewMessageFormComponent,
    LoginFormComponent,
    AutoScrollDirective,
    ConnectedPeopleListComponent,
    ChatComponent,
    WelcomeComponent,
    SubscribeFormComponent,
    ErrorComponent,
    ErrorMessageComponent,
    InstantInvitationComponent,
    InvitationListComponent,
    InvitationFormComponent,
    ContactListComponent,
    ContactComponent,
    ProfilComponent,
    DiscussionsListComponent,
    AboutComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatButtonModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatIconModule,
    MatMenuModule,
    MatSidenavModule,
    MatListModule,
    MatButtonToggleModule,
    MatDividerModule
  ],
  entryComponents: [
    ProfilComponent
  ],
  providers: [
    InstantMessagingService,
    RoutingService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
