import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageNetworkPartnersComponent } from './manage-network-partners.component';

describe('ManageNetworkPartnersComponent', () => {
  let component: ManageNetworkPartnersComponent;
  let fixture: ComponentFixture<ManageNetworkPartnersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageNetworkPartnersComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageNetworkPartnersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
