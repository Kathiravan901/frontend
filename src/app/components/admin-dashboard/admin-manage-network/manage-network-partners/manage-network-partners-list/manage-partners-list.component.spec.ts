import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManagePartnersListComponent } from './manage-partners-list.component';

describe('ManagePartnersListComponent', () => {
  let component: ManagePartnersListComponent;
  let fixture: ComponentFixture<ManagePartnersListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagePartnersListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ManagePartnersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
