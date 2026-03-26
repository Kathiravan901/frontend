import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TopInventoryTurnsComponent } from './top-inventory-turns.component';

describe('TopInventoryTurnsComponent', () => {
  let component: TopInventoryTurnsComponent;
  let fixture: ComponentFixture<TopInventoryTurnsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopInventoryTurnsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TopInventoryTurnsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
