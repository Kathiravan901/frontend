import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProcurementViewPartnersComponent } from './procurement-view-partners.component';

describe('ProcurementViewPartnersComponent', () => {
  let component: ProcurementViewPartnersComponent;
  let fixture: ComponentFixture<ProcurementViewPartnersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcurementViewPartnersComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProcurementViewPartnersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
