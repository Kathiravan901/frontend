import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProcurementViewLocationsComponent } from './procurement-view-locations.component';

describe('ProcurementViewLocationsComponent', () => {
  let component: ProcurementViewLocationsComponent;
  let fixture: ComponentFixture<ProcurementViewLocationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcurementViewLocationsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProcurementViewLocationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
