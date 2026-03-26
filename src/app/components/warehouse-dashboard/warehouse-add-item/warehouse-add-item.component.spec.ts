import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WarehouseAddItemComponent } from './warehouse-add-item.component';

describe('WarehouseAddItemComponent', () => {
  let component: WarehouseAddItemComponent;
  let fixture: ComponentFixture<WarehouseAddItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WarehouseAddItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WarehouseAddItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
