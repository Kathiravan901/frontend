import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WarehouseAddUomComponent } from './warehouse-add-uom.component';

describe('WarehouseAddUomComponent', () => {
  let component: WarehouseAddUomComponent;
  let fixture: ComponentFixture<WarehouseAddUomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WarehouseAddUomComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WarehouseAddUomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
