import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectedPeopleListComponent } from './connected-people-list.component';

describe('ConnectedPeopleListComponent', () => {
  let component: ConnectedPeopleListComponent;
  let fixture: ComponentFixture<ConnectedPeopleListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConnectedPeopleListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectedPeopleListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
