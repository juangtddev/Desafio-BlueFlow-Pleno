import https from 'https';
import { PassThrough } from 'stream';
import { YouTubeAdapter } from '../YoutubeAdapter';

jest.mock('https');

describe('YouTubeAdapter', () => {
  beforeAll(() => {
    process.env.YOUTUBE_API_KEY = 'fake-api-key';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw an error if YOUTUBE_API_KEY is not set', () => {
    delete process.env.YOUTUBE_API_KEY;
    expect(() => new YouTubeAdapter()).toThrow(
      'YOUTUBE_API_KEY is not defined',
    );
    process.env.YOUTUBE_API_KEY = 'fake-api-key';
  });

  it('should search for videos and return a formatted list', async () => {
    const mockApiResponse = {
      items: [{ id: { videoId: '123' }, snippet: { title: 'Test Video' } }],
    };
    const responseStream = new PassThrough();
    responseStream.write(JSON.stringify(mockApiResponse));
    responseStream.end();

    (https.get as jest.Mock).mockImplementation((_url, callback) => {
      callback(responseStream);
      return { on: jest.fn() };
    });

    const adapter = new YouTubeAdapter();
    const videos = await adapter.searchVideos('test query');

    expect(videos).toHaveLength(1);
    expect(videos[0].snippet.title).toBe('Test Video');
    expect(https.get).toHaveBeenCalledWith(
      expect.stringContaining('q=test+query'),
      expect.any(Function),
    );
  });

  it('should list popular videos and return a formatted list', async () => {
    const mockApiResponse = {
      items: [{ id: '456', snippet: { title: 'Popular Video' } }],
    };
    const responseStream = new PassThrough();
    responseStream.write(JSON.stringify(mockApiResponse));
    responseStream.end();

    (https.get as jest.Mock).mockImplementation((_url, callback) => {
      callback(responseStream);
      return { on: jest.fn() };
    });

    const adapter = new YouTubeAdapter();
    const videos = await adapter.listPopularVideos();

    expect(videos).toHaveLength(1);
    expect(videos[0].snippet.title).toBe('Popular Video');
    expect(https.get).toHaveBeenCalledWith(
      expect.stringContaining('chart=mostPopular'),
      expect.any(Function),
    );
  });

  it('should reject the promise if the API returns an error', async () => {
    const mockApiError = {
      error: { message: 'API limit exceeded' },
    };
    const responseStream = new PassThrough();
    responseStream.write(JSON.stringify(mockApiError));
    responseStream.end();

    (https.get as jest.Mock).mockImplementation((_url, callback) => {
      callback(responseStream);
      return { on: jest.fn() };
    });

    const adapter = new YouTubeAdapter();
    await expect(adapter.searchVideos('any')).rejects.toThrow(
      'API limit exceeded',
    );
  });
});
