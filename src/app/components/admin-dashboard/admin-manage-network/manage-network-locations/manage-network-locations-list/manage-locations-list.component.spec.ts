import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageLocationsListComponent } from './manage-locations-list.component';

describe('ManageLocationsListComponent', () => {
  let component: ManageLocationsListComponent;
  let fixture: ComponentFixture<ManageLocationsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageLocationsListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageLocationsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
