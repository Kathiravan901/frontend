import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageNetworkLanesComponent } from './manage-network-lanes.component';

describe('ManageNetworkLanesComponent', () => {
  let component: ManageNetworkLanesComponent;
  let fixture: ComponentFixture<ManageNetworkLanesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageNetworkLanesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageNetworkLanesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
