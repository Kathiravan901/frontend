import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WarehouseManageInventoryComponent } from './warehouse-manage-inventory.component';

describe('WarehouseManageInventoryComponent', () => {
  let component: WarehouseManageInventoryComponent;
  let fixture: ComponentFixture<WarehouseManageInventoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WarehouseManageInventoryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WarehouseManageInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
