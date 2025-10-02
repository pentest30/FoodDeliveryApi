import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubscriptionsView } from './subscriptions-view';

describe('SubscriptionsView', () => {
  let component: SubscriptionsView;
  let fixture: ComponentFixture<SubscriptionsView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriptionsView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubscriptionsView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
