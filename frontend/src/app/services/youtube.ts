import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class YouTubeService {
  constructor(private api: ApiService) {}

  getPetWithYouTubeInfo(petId: string) {
    return this.api.get(`/pets/${petId}/youtube`);
  }

  extractVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/ 
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }
    return null;
  }

  validateVideoId(videoId: string): boolean {
    return /^[a-zA-Z0-9_-]{11}$/.test(videoId);
  }
}