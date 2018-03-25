import { Component} from '@angular/core';
import { InstantMessagingService } from '../instant-messaging.service';
import { DiscussionsListItemName } from '../discussions-list-item-name';


@Component({
  selector: 'app-discussions-list',
  templateUrl: './discussions-list.component.html',
  styleUrls: ['./discussions-list.component.css']
})
export class DiscussionsListComponent {

  constructor(private service: InstantMessagingService) { }

  private onSelect(discussion: DiscussionsListItemName) {
    console.log(discussion.id);
    this.service.sendFetchDiscussion(discussion.id);
  }

  private quitDiscussion(discussionId: string) {
    this.service.sendQuitDiscussion(discussionId);
  }
}
