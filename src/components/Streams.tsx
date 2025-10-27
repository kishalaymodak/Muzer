"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronUp, ChevronDown, Play, Share2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import AppBar from "@/components/AppBar";
import LiteYouTubeEmbed from "react-lite-youtube-embed";
import { YT_REGEX } from "@/lib/regex";
import YouTubePlayer from "youtube-player";

interface streams {
  upvots: Array<{
    id: string;
    userId: string;
    streamId: string;
  }>;
}

interface Video {
  id: string;
  type: string;
  url: string;
  extractedId: string;
  title: string;
  smallImageUrl: string;
  bigImageUrl: string;
  active: boolean;
  userId: string;
  upvotes: number;
  haveUpvoted: boolean;
}

const REFRESH_INTERVAL_MS = 10 * 1000;

export default function Streams({
  creatorId,
  playVideo,
}: {
  creatorId: string;
  playVideo: boolean;
}) {
  const [inputLink, setInputLink] = useState("");
  const [queue, setQueue] = useState<Video[]>([]);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(false);
  const [playNextLoader, setPlayNextLoader] = useState(false);
  const videoPlayerRef = useRef<HTMLDivElement>();
  // console.log(creatorId);

  async function refreshStreams() {
    const res = await fetch(`/api/streams/?creatorId=${creatorId}`, {
      credentials: "include",
    });
    // console.log("stream data");

    const json = await res.json();
    console.log(json.streams);

    setQueue(
      json.streams.sort((a: streams, b: streams) =>
        a.upvots < b.upvots ? 1 : -1
      )
    );

    setCurrentVideo((video) => {
      if (video?.id === json.activeStream?.stream?.id) {
        return video;
      }
      // console.log("looging from setCurrentVideo");

      // console.log(json.activeStream.stream);

      return json.activeStream.stream;
    });
  }

  useEffect(() => {
    refreshStreams();
    const interval = setInterval(() => {
      refreshStreams();
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!videoPlayerRef.current || !currentVideo) {
      return;
    }
    // console.log("vedio play ref");

    // console.log(videoPlayerRef);

    const player = YouTubePlayer(videoPlayerRef.current);
    player.loadVideoById(currentVideo.extractedId);
    player.playVideo();

    function eventHandler(event: CustomEvent & { data: number }) {
      // console.log(event);

      if (event.data === 0) {
        playNext();
      }
    }

    player.on("stateChange", eventHandler);
    return () => {
      player.destroy();
    };
  }, [currentVideo, videoPlayerRef]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/streams/", {
        method: "POST",
        body: JSON.stringify({
          creatorId,
          url: inputLink,
        }),
      });

      const newVideo = await res.json();
      // console.log(newVideo);

      setQueue([...queue, newVideo]);
      setInputLink("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add video to queue",
      });
    }
    setLoading(false);
  };

  const handleVote = async (id: string, isUpvote: boolean) => {
    setQueue(
      queue
        .map((video) =>
          video.id === id
            ? {
                ...video,
                upvotes: isUpvote ? video.upvotes + 1 : video.upvotes - 1,
                haveUpvoted: !video.haveUpvoted,
              }
            : video
        )
        .sort((a, b) => b.upvotes - a.upvotes || 0)
    );

    try {
      await fetch(`/api/streams/${isUpvote ? "upvotes" : "downvotes"}`, {
        method: "POST",
        body: JSON.stringify({
          streamId: id,
        }),
      });
      // console.log("handel vote");

      // console.log(res);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to register vote",
      });
    }
  };

  const playNext = async () => {
    if (queue.length > 0) {
      try {
        setPlayNextLoader(true);
        const data = await fetch("/api/streams/next");
        const json = await data.json();
        // console.log("from play next");

        // console.log(json);

        setCurrentVideo(json.streams);
        setQueue((q) => q.filter((x) => x.id !== json.streams?.id));
      } catch (e) {
        toast({
          title: "Error",
          description: "Failed to play next video",
        });
      }
      setPlayNextLoader(false);
    }
  };

  const handleShare = () => {
    const shareableLink = `${window.location.hostname}/creator/${creatorId}`;
    navigator.clipboard
      .writeText(shareableLink)
      .then(() => {
        toast({
          title: "Success",
          description: "Link copied to clipboard!",
        });
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "Failed to copy link",
        });
      });
  };
  // console.log("current video data");

  // console.log(currentVideo);

  return (
    <div className="flex flex-col min-h-screen bg-[rgb(10,10,10)] text-gray-200">
      <AppBar />
      <div className="flex justify-center">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5 w-screen max-w-72 sm:max-w-lg md:max-w-screen-xl pt-8">
          <div className="col-span-3">
            {!window.matchMedia("(min-width: 768px)").matches && (
              <div className="md:hidden">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-white">Now Playing</h2>
                  <Card className="bg-gray-900 border-gray-800">
                    <CardContent className="p-2">
                      {currentVideo ? (
                        <div>
                          {playVideo ? (
                            //@ts-expect-error video ref

                            <div ref={videoPlayerRef} className="h-64 w-full" />
                          ) : (
                            <>
                              <img
                                src={currentVideo.bigImageUrl}
                                className="w-full h-64 object-cover rounded"
                                alt={currentVideo.title}
                              />
                              <p className="mt-2 text-center font-semibold text-white">
                                {currentVideo.title}
                              </p>
                            </>
                          )}
                        </div>
                      ) : (
                        <p className="text-center py-8 text-gray-400">
                          No video playing
                        </p>
                      )}
                    </CardContent>
                  </Card>
                  {playVideo && (
                    <Button
                      disabled={playNextLoader}
                      onClick={playNext}
                      className="w-full bg-purple-700 hover:bg-purple-800 text-white"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      {playNextLoader ? "Loading..." : "Play next"}
                    </Button>
                  )}
                </div>
              </div>
            )}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white">Upcoming Songs</h2>
              {queue.length === 0 && (
                <Card className="bg-gray-900 border-gray-800 w-full">
                  <CardContent className="p-4">
                    <p className="text-center py-8 text-gray-400">
                      No videos in queue
                    </p>
                  </CardContent>
                </Card>
              )}
              {queue.map((video) => (
                <Card key={video.id} className="bg-gray-900 border-gray-800">
                  <CardContent className="p-4 flex items-center space-x-4">
                    <img
                      src={video.smallImageUrl}
                      alt={`Thumbnail for ${video.title}`}
                      className="w-30 h-20 object-cover rounded"
                    />
                    <div className="flex-grow">
                      <h3 className="font-semibold text-white">
                        {video.title}
                      </h3>
                      <div className="flex items-center space-x-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleVote(
                              video.id,
                              video.haveUpvoted ? false : true
                            )
                          }
                          className="flex items-center space-x-1 bg-gray-800 text-white border-gray-700 hover:bg-gray-700"
                        >
                          {video.haveUpvoted ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronUp className="h-4 w-4" />
                          )}
                          <span>{video.upvotes}</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <div className="col-span-2">
            <div className="max-w-4xl mx-auto p-4 space-y-6 w-full">
              <div className="flex justify-between items-center">
                <h1 className="text-xl font-bold text-white">Add a song</h1>
                <Button
                  onClick={handleShare}
                  className="bg-purple-700 hover:bg-purple-800 text-white"
                >
                  <Share2 className="mr-2 h-4 w-4" /> Share
                </Button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-2">
                <Input
                  type="text"
                  placeholder="Paste YouTube link here"
                  value={inputLink}
                  onChange={(e) => setInputLink(e.target.value)}
                  className="bg-gray-900 text-white border-gray-700 placeholder-gray-500"
                />
                <Button
                  disabled={loading}
                  type="submit"
                  className="w-full bg-purple-700 hover:bg-purple-800 text-white"
                >
                  {loading ? "Loading..." : "Add to Queue"}
                </Button>
              </form>
              {inputLink && inputLink.match(YT_REGEX) && !loading && (
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-4">
                    <LiteYouTubeEmbed
                      title=""
                      id={inputLink.match(YT_REGEX)?.[1] ?? ""}
                    />
                  </CardContent>
                </Card>
              )}
              {window.matchMedia("(min-width: 768px)").matches && (
                <div className="hidden md:block">
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-white">
                      Now Playing
                    </h2>
                    <Card className="bg-gray-900 border-gray-800">
                      <CardContent className="p-4">
                        {currentVideo ? (
                          <div>
                            {playVideo ? (
                              //@ts-expect-error video ref

                              <div ref={videoPlayerRef} className="w-full" />
                            ) : (
                              <>
                                <img
                                  src={currentVideo.bigImageUrl}
                                  className="w-full h-72 object-cover rounded"
                                  alt={currentVideo.title}
                                />

                                <p className="mt-2 text-center font-semibold text-white">
                                  {currentVideo.title}
                                </p>
                              </>
                            )}
                          </div>
                        ) : (
                          <p className="text-center py-8 text-gray-400">
                            No video playing
                          </p>
                        )}
                      </CardContent>
                    </Card>
                    {playVideo && (
                      <Button
                        disabled={playNextLoader}
                        onClick={playNext}
                        className="w-full bg-purple-700 hover:bg-purple-800 text-white"
                      >
                        <Play className="mr-2 h-4 w-4" />
                        {playNextLoader ? "Loading..." : "Play next"}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
