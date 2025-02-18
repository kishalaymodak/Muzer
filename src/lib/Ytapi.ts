export async function getVideoDetails(videoId: string, apiKey: string) {
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();

    if (data.items && data.items.length > 0) {
      const video = data.items[0].snippet;
      const thumbnails = video.thumbnails;

      const thumbnailUrls: { [key: string]: string } = {};
      for (const key in thumbnails) {
        thumbnailUrls[key] = thumbnails[key].url;
      }

      return {
        id: videoId,
        title: video.title,
        thumbnail: thumbnailUrls,
      };
    } else {
      return { error: "Video not found" };
    }
  } catch (error) {
    return { error: "Error fetching video details" };
  }
}
