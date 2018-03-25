import { TestBed, inject } from '@angular/core/testing';

import { InstantMessagingService } from './instant-messaging.service';

describe('InstantMessagingService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [InstantMessagingService]
    });
  });

  it('should ...', inject([InstantMessagingService], (service: InstantMessagingService) => {
    expect(service).toBeTruthy();
  }));
});
