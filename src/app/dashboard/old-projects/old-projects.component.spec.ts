import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OldProjectsComponent } from './old-projects.component';

describe('OldProjectsComponent', () => {
  let component: OldProjectsComponent;
  let fixture: ComponentFixture<OldProjectsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OldProjectsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OldProjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
