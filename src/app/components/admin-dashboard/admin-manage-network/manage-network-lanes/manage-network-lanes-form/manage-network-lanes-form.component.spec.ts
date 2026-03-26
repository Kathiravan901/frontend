import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageLanesFormComponent } from './manage-network-lanes-form.component';

describe('ManageLanesFormComponent', () => {
  let component: ManageLanesFormComponent;
  let fixture: ComponentFixture<ManageLanesFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageLanesFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageLanesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
