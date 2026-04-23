import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-youtube-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './youtube-player.html',
  styleUrl: './youtube-player.css'
})
export class YouTubePlayer implements OnChanges {
  @Input() videoId: string = '';
  @Input() showInfo: boolean = false;
  @Input() videoInfo: any = null;
  
  embedUrl: SafeResourceUrl | null = null;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['videoId'] && this.videoId) {
      this.embedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        `https://www.youtube.com/embed/${this.videoId}`
      );
    }
  }
}