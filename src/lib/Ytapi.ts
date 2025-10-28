"use server";

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

export async function searchVideos(query: string) {
  console.log(query);
  const apiKey = process.env.YT_API_KEY;
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${query}&key=${apiKey}&maxResults=5`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();

    const results = data.items.map((item: any) => {
      const videoId = item.id.videoId;
      const snippet = item.snippet;
      const thumbnails = snippet.thumbnails;

      const thumbnailUrls: { [key: string]: string } = {};
      for (const key in thumbnails) {
        thumbnailUrls[key] = thumbnails[key].url;
      }

      return {
        id: videoId,
        title: snippet.title,
        thumbnail: thumbnailUrls,
      };
    });

    return results;
  } catch (error) {
    return { error: "Error searching videos" };
  }
}
