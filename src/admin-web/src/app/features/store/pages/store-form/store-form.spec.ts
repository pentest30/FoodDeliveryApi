import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreForm } from './store-form';

describe('StoreForm', () => {
  let component: StoreForm;
  let fixture: ComponentFixture<StoreForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StoreForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
