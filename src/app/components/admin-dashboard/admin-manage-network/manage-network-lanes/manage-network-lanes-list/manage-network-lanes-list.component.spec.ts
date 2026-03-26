import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageLanesListComponent } from './manage-network-lanes-list.component';

describe('ManageLanesListComponent', () => {
  let component: ManageLanesListComponent;
  let fixture: ComponentFixture<ManageLanesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageLanesListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageLanesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
