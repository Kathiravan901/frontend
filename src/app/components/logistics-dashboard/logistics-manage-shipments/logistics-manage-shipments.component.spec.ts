import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LogisticsManageShipmentsComponent } from './logistics-manage-shipments.component';

describe('LogisticsManageShipmentsComponent', () => {
  let component: LogisticsManageShipmentsComponent;
  let fixture: ComponentFixture<LogisticsManageShipmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogisticsManageShipmentsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LogisticsManageShipmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
