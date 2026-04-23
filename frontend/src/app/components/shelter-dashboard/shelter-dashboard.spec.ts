import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShelterDashboard } from './shelter-dashboard';

describe('ShelterDashboard', () => {
  let component: ShelterDashboard;
  let fixture: ComponentFixture<ShelterDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShelterDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShelterDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
