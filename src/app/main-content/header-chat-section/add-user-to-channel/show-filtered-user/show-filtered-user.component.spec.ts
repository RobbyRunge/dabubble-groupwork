import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowFilteredUserComponent } from './show-filtered-user.component';

describe('ShowFilteredUserComponent', () => {
  let component: ShowFilteredUserComponent;
  let fixture: ComponentFixture<ShowFilteredUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowFilteredUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowFilteredUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
