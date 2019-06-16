import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LineChartPlacesReviewsComponent } from './line-chart-places-reviews.component';

describe('LineChartPlacesReviewsComponent', () => {
  let component: LineChartPlacesReviewsComponent;
  let fixture: ComponentFixture<LineChartPlacesReviewsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LineChartPlacesReviewsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LineChartPlacesReviewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
