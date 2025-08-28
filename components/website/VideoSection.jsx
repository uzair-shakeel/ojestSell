"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize2 } from "lucide-react";

const VideoSection = () => {
  const [activeCard, setActiveCard] = useState("personal");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState(1);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const videoCards = [
    {
      id: "personal",
      title: "Personal",
      description:
        "The all-in-one plan for buying and selling cars. Home or away, local or global — move freely between markets and currencies.",
      background: "from-amber-50 to-orange-100",
      accent: "from-amber-400 to-orange-500",
      video: "/video.mp4",
    },
    {
      id: "business",
      title: "Business",
      description:
        "For those who want a platform that does more for their automotive business — there's Ojest Business.",
      background: "from-orange-100 to-yellow-100",
      accent: "from-orange-500 to-yellow-600",
      video: "/video.mp4",
    },
    {
      id: "freelance",
      title: "Freelance",
      description:
        "Perfect for independent car dealers and brokers who need flexibility and professional tools.",
      background: "from-green-100 to-emerald-100",
      accent: "from-green-500 to-emerald-600",
      video: "/video.mp4",
    },
  ];

  // Combined handler for both hover and click
  const handleCardInteraction = (cardId, eventType) => {
    console.log("Card interaction:", cardId, eventType); // Debug log
    setActiveCard(cardId);
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.muted = false;
      setIsMuted(false);
      videoRef.current.play();
    }
  };

  // Robust click handler for mobile
  const handleCardClick = (cardId, event) => {
    event.preventDefault();
    event.stopPropagation();
    console.log("Card clicked:", cardId); // Debug log

    // Force state update for mobile
    setActiveCard(cardId);
    setIsPlaying(true);

    // Immediate autoplay
    const videoElement = event.currentTarget.querySelector("video");
    if (videoElement) {
      videoElement.muted = false;
      videoElement.currentTime = 0; // Reset to beginning
      videoElement.play().catch((err) => {
        console.log("Video play error:", err);
      });
    }
  };

  // Handle card hover (desktop only)
  const handleCardHover = (cardId) => {
    if (!isMobile) {
      console.log("Card hovered:", cardId); // Debug log
      setActiveCard(cardId);
      setIsPlaying(true);

      // Immediate autoplay
      const videoElement = document.querySelector(
        `[data-card-id="${cardId}"] video`
      );
      if (videoElement) {
        videoElement.muted = false;
        videoElement.currentTime = 0; // Reset to beginning
        videoElement.play().catch((err) => {
          console.log("Video play error:", err);
        });
      }
    }
  };

  const handleCardLeave = () => {
    // Don't reset to null, keep the last active card
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  // Auto-hide controls after 3 seconds
  useEffect(() => {
    if (isPlaying && showControls) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying, showControls]);

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const handleVolumeChange = useCallback(
    (e) => {
      const newVolume = Number.parseFloat(e.target.value);
      if (videoRef.current) {
        videoRef.current.volume = newVolume;
        setVolume(newVolume);
        if (newVolume === 0) {
          setIsMuted(true);
          videoRef.current.muted = true;
        } else if (isMuted) {
          setIsMuted(false);
          videoRef.current.muted = false;
        }
      }
    },
    [isMuted]
  );

  const handleRestart = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
      setIsPlaying(false);
    }
  }, []);

  const skipTime = useCallback(
    (seconds) => {
      if (videoRef.current) {
        const newTime = Math.max(
          0,
          Math.min(videoRef.current.currentTime + seconds, duration)
        );
        videoRef.current.currentTime = newTime;
      }
    },
    [duration]
  );

  const handleFullscreen = useCallback(() => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current
          .requestFullscreen()
          .then(() => {
            setIsFullscreen(true);
          })
          .catch((err) => {
            console.log("Fullscreen failed:", err);
          });
      } else {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false);
        });
      }
    }
  }, []);

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 1000);
    }
  }, [isPlaying]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  }, []);

  const handleSeek = useCallback(
    (e) => {
      if (videoRef.current && duration > 0) {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const seekTime = (clickX / width) * duration;
        videoRef.current.currentTime = seekTime;
      }
    },
    [duration]
  );

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <section className="relative py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-10 max-w-[1920px]">
        <div className="mb-16 flex flex-col lg:flex-row items-start justify-between gap-8 lg:gap-0">
          {/* Left side - Heading */}
          <div className="flex-1 max-w-3xl lg:max-w-3xl w-full">
            <div className="inline-block mb-6">
              <span className="text-sm font-semibold bg-green-50 px-3 py-2 rounded-full shadow-sm text-green-600 tracking-wider uppercase">
                Get a Car now
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-black leading-[0.9] mb-0">
              Discover the{" "}
              <span className="relative inline-block">
                freedom
                <svg
                  className="absolute -bottom-1 left-0 w-full h-4"
                  viewBox="0 0 300 20"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M5,15 Q75,5 150,12 Q225,8 295,15"
                    stroke="#10b981"
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <br />
              of car buying & selling
            </h1>
          </div>

          {/* Right side - Description and Button */}
          <div className="flex-shrink-0 lg:ml-16 max-w-md w-full lg:w-auto pt-0 lg:pt-16">
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              Get seamless car listings, instant offers, secure payments, and
              expert support — all in one scalable platform designed for modern
              automotive commerce.
            </p>

            <button className="bg-black text-white px-1 pl-8 py-1 flex items-center min-w-[220px] justify-between rounded-full font-medium hover:bg-gray-800 transition-colors duration-200 space-x-3 group">
              <span>GET STARTED</span>
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </button>
          </div>
        </div>

        {/* Three Video Cards - Digital Banking Style */}
        <div className="flex flex-col lg:flex-row gap-4 h-auto lg:h-[500px] transition-all duration-1000 ease-out">
          {videoCards.map((card, index) => (
            <div
              key={card.id}
              data-card-id={card.id}
              className={`relative group cursor-pointer transition-all duration-1000 ease-out overflow-hidden rounded-3xl shadow-2xl border border-gray-100 flex-shrink-0 ${
                activeCard === card.id
                  ? "w-full lg:w-[58.33%] h-[600px] lg:h-full bg-gradient-to-br " +
                    card.accent
                  : activeCard
                  ? "w-full lg:w-[20.83%] h-[100px] lg:h-full bg-gradient-to-br " +
                    card.background
                  : "w-full lg:w-[33.33%] h-[100px] lg:h-full bg-gradient-to-br " +
                    card.background
              }`}
              onMouseEnter={() => handleCardHover(card.id)}
              onMouseLeave={handleCardLeave}
              onClick={(event) => handleCardClick(card.id, event)}
              onTouchStart={() => handleCardInteraction(card.id, "touch")}
            >
              {/* Card Background Pattern */}
              <div className="absolute inset-0 opacity-20 transition-opacity duration-1000 ease-out">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                <div className="absolute top-0 left-0 w-full h-full">
                  <svg
                    className="w-full h-full"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M0,50 Q25,25 50,50 T100,50 L100,100 L0,100 Z"
                      fill="currentColor"
                      className="text-white/20"
                    />
                  </svg>
                </div>
              </div>

              {/* Card Content */}
              <div className="relative z-10 h-full flex flex-col transition-all duration-1000 ease-out">
                {/* Video Player - Always visible and full size */}
                <div className="w-full h-full relative bg-black/20 rounded-3xl overflow-hidden backdrop-blur-sm transition-all duration-1000 ease-out">
                  <video
                    className="w-full h-full object-cover"
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                    playsInline
                    preload="metadata"
                    muted={activeCard !== card.id}
                    autoPlay={activeCard === card.id}
                    loop
                  >
                    <source src={card.video} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>

                  {/* Video Overlay */}
                  <div className="absolute inset-0 bg-black/10" />

                  {/* Play Button Overlay - Only show when not playing */}
                  {!isPlaying && activeCard === card.id && (
                    <div className="absolute inset-0 flex items-center justify-center transition-all duration-1000 ease-out">
                      <button
                        onClick={togglePlay}
                        className="w-20 h-20 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl hover:shadow-3xl transition-all duration-300 ease-out hover:scale-110 border border-white/20"
                      >
                        <Play className="w-10 h-10 text-blue-600 ml-1" />
                      </button>
                    </div>
                  )}

                  {/* Video Controls - Show for active card */}
                  {showControls && activeCard === card.id && isPlaying && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 rounded-b-3xl transition-all duration-1000 ease-out">
                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div
                          className="w-full h-2 bg-white/20 rounded-full cursor-pointer relative"
                          onClick={handleSeek}
                        >
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300 ease-out"
                            style={{
                              width: `${
                                duration > 0
                                  ? (currentTime / duration) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Control Buttons */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={togglePlay}
                            className="text-white hover:text-blue-300 transition-colors duration-300 ease-out p-2 rounded-full hover:bg-white/10"
                          >
                            {isPlaying ? (
                              <Pause className="w-5 h-5" />
                            ) : (
                              <Play className="w-5 h-5" />
                            )}
                          </button>

                          <button
                            onClick={toggleMute}
                            className="text-white hover:text-blue-300 transition-colors duration-300 ease-out p-2 rounded-full hover:bg-white/10"
                          >
                            {isMuted ? (
                              <VolumeX className="w-5 h-5" />
                            ) : (
                              <Volume2 className="w-5 h-5" />
                            )}
                          </button>
                        </div>

                        <button
                          onClick={handleFullscreen}
                          className="text-white hover:text-blue-300 transition-colors duration-300 ease-out p-2 rounded-full hover:bg-white/10"
                        >
                          <Maximize2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Video Status Indicator */}
                  {activeCard !== card.id && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black/50 text-white px-4 py-2 rounded-full text-sm font-medium">
                        Hover to play
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VideoSection;
