import { UserIdAndName } from './user-id-and-name';

export class DiscussionsListItem {
    constructor(public id: string, public participants: UserIdAndName[]) {
     }
  }
