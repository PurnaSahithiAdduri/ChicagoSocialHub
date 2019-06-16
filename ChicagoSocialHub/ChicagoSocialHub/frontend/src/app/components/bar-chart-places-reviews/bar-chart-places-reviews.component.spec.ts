import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BarChartPlacesReviewsComponent } from './bar-chart-places-reviews.component';

describe('BarChartPlacesReviewsComponent', () => {
  let component: BarChartPlacesReviewsComponent;
  let fixture: ComponentFixture<BarChartPlacesReviewsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BarChartPlacesReviewsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BarChartPlacesReviewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
