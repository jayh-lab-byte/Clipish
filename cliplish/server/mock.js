// Deliberately fictional design fixtures, never returned by a production server.
// No invented video IDs are sent to YouTube and no sample is presented as live metadata.
const samples = [
  ['Stop saying “very good” — Natural Alternatives', 'English with Lucy', 'PRONUNCIATION', 42],
  ['Connected Speech in Fast Conversations', 'Rachel’s English', 'LISTENING', 54],
  ['5 Business Idioms You Need Every Day', 'Speak Confident English', 'LESSON', 72],
  ['How to Disagree Without Being Impolite', 'BBC Learning English', 'SCENE', 48],
  ['The Subtle Art of the Glottal Stop', 'Pronunciation with Emma', 'PRONUNCIATION', 38],
  ['How Joey says “How you doin’?” in everyday conversation', 'English Scene', 'SCENE', 31],
  ['Listen for the Words Between the Words', 'Sample English Studio', 'LISTENING', 65],
  ['A More Natural Way to Say Thank You', 'Sample English Studio', 'LESSON', 45],
  ['A Short Conversation at the Café', 'Sample English Scene', 'SCENE', 58],
  ['One Minute of Everyday English', 'Sample English Studio', 'LESSON', 60],
];
export function mockFeed(date) {
  return { date, count: 10, source: 'mock', videos: samples.map(([title, channelTitle, contentType, durationSeconds], index) => ({
    id: `demo-clip-${index + 1}`, position: index + 1, title, channelTitle, channelId: `demo-channel-${index % 4}`,
    contentType, durationSeconds, thumbnailUrl: `/assets/stitch-thumb-${[1, 3, 4, 5, 6, 2, 3, 4, 5, 1][index]}.jpg`,
    publishedAt: `${date}T00:00:00Z`, viewCount: 184000, youtubeUrl: null, embeddable: false, mock: true,
  })) };
}
