import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageLocationsFormComponent } from './manage-locations-form.component';

describe('ManageLocationsFormComponent', () => {
  let component: ManageLocationsFormComponent;
  let fixture: ComponentFixture<ManageLocationsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageLocationsFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageLocationsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
