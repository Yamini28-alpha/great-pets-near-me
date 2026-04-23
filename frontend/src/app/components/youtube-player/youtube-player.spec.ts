import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YoutubePlayer } from './youtube-player';

describe('YoutubePlayer', () => {
  let component: YoutubePlayer;
  let fixture: ComponentFixture<YoutubePlayer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [YoutubePlayer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(YoutubePlayer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
