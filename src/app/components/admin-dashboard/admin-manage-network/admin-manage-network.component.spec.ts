import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminManageNetworkComponent } from './admin-manage-network.component';

describe('AdminManageNetworkComponent', () => {
  let component: AdminManageNetworkComponent;
  let fixture: ComponentFixture<AdminManageNetworkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminManageNetworkComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminManageNetworkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
