import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExecutiveRisksComponent } from './executive-risks.component';

describe('ExecutiveRisksComponent', () => {
  let component: ExecutiveRisksComponent;
  let fixture: ComponentFixture<ExecutiveRisksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExecutiveRisksComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExecutiveRisksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
