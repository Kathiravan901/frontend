import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageNetworkLocationsComponent } from './manage-network-locations.component';

describe('ManageNetworkLocationsComponent', () => {
  let component: ManageNetworkLocationsComponent;
  let fixture: ComponentFixture<ManageNetworkLocationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageNetworkLocationsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageNetworkLocationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
