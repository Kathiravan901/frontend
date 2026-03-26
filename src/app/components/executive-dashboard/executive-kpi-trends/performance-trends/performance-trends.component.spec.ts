import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PerformanceTrendsComponent } from './performance-trends.component';

describe('PerformanceTrendsComponent', () => {
  let component: PerformanceTrendsComponent;
  let fixture: ComponentFixture<PerformanceTrendsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerformanceTrendsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PerformanceTrendsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
