import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InstantInvitationComponent } from './instant-invitation.component';

describe('InstantInvitationComponent', () => {
  let component: InstantInvitationComponent;
  let fixture: ComponentFixture<InstantInvitationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InstantInvitationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InstantInvitationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
