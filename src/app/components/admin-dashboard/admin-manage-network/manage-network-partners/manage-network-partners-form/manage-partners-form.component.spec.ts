import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManagePartnersFormComponent } from './manage-partners-form.component';

describe('ManagePartnersFormComponent', () => {
  let component: ManagePartnersFormComponent;
  let fixture: ComponentFixture<ManagePartnersFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagePartnersFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ManagePartnersFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
