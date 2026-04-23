import axios from 'axios';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || '';
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

interface YouTubeVideoInfo {
  title: string;
  description: string;
  thumbnailUrl: string;
  channelTitle: string;
  publishedAt: string;
}

export class YouTubeService {
  async getVideoInfo(videoId: string): Promise<YouTubeVideoInfo | null> {
    try {
      const response = await axios.get(`${YOUTUBE_API_BASE_URL}/videos`, {
        params: {
          part: 'snippet',
          id: videoId,
          key: YOUTUBE_API_KEY
        }
      });

      if (response.data.items && response.data.items.length > 0) {
        const video = response.data.items[0].snippet;
        return {
          title: video.title,
          description: video.description,
          thumbnailUrl: video.thumbnails.high.url,
          channelTitle: video.channelTitle,
          publishedAt: video.publishedAt
        };
      }
      return null;
    } catch (error) {
      console.error('YouTube API error:', error);
      return null;
    }
  }

  validateVideoId(videoId: string): boolean {
    const youtubeRegex = /^[a-zA-Z0-9_-]{11}$/;
    return youtubeRegex.test(videoId);
  }

  getEmbedUrl(videoId: string): string {
    return `https://www.youtube.com/embed/${videoId}`;
  }
}

export const youtubeService = new YouTubeService();