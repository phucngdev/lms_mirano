import { VideoUrlEntity } from '#/api/requests';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
  SoundOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
} from '@ant-design/icons';
import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import './LessonVideo.scss';
import { getVideoByIdLessonService } from '#/api/services/video.service';
import { updateLessonProgress } from '#/api/services/lesson-progress.service';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '#/src/redux/store/store';
import { message } from 'antd';

const LessonVideo = () => {
  const { lessonId } = useParams();
  const { data: lessons } = useSelector((state: RootState) => state.lesson);
  const [lessonVideo, setLessonVideo] = useState<VideoUrlEntity | null>(null);
  const [playing, setPlaying] = useState(false);
  const [played, setPlayed] = useState(0);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const playerRef = useRef<ReactPlayer>(null);
  const playerWrapperRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedProgressRef = useRef<number>(0);
  const lessonIdRef = useRef<string | undefined>(lessonId);
  const durationRef = useRef<number>(0);
  const playedSecondsRef = useRef<number>(0);
  const maxAllowedProgressRef = useRef<number>(0);

  // Get current lesson progress from Redux
  const currentLesson = lessons.find(lesson => lesson.id === lessonId);
  const lessonProgress = currentLesson?.progress || 0;

  const fetchVideo = async () => {
    try {
      const response = await getVideoByIdLessonService(lessonId || '', 1, 0);
      setLessonVideo(response.data.data.items[0]);
    } catch (error) {
      console.error(error);
      message.error('Lỗi khi tải video');
    }
  };

  useEffect(() => {
    fetchVideo();
    lessonIdRef.current = lessonId;
  }, [lessonId]);

  // Set up interval to save progress every 5 seconds
  useEffect(() => {
    if (playing && lessonId && duration > 0) {
      progressIntervalRef.current = setInterval(() => {
        saveProgress();
      }, 5000); // Every 5 seconds
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [playing, lessonId, duration]);

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      // Save progress on unmount
      saveProgress();
    };
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgress = (state: {
    played: number;
    playedSeconds: number;
    loaded: number;
    loadedSeconds: number;
  }) => {
    setPlayed(state.played);
    setPlayedSeconds(state.playedSeconds);
    playedSecondsRef.current = state.playedSeconds;
  };

  const handleDuration = (duration: number) => {
    setDuration(duration);
    durationRef.current = duration;
    // Calculate max allowed time based on lesson progress
    maxAllowedProgressRef.current = (lessonProgress / 100) * duration;
  };

  // Update max allowed progress when lessonProgress or duration changes
  useEffect(() => {
    if (durationRef.current > 0 && lessonProgress > 0) {
      const maxAllowedTime = (lessonProgress / 100) * durationRef.current;
      maxAllowedProgressRef.current = maxAllowedTime;

      // Auto-seek to saved progress position when video loads
      if (playerRef.current && playedSecondsRef.current === 0) {
        const savedPlayed = maxAllowedTime / durationRef.current;
        playerRef.current.seekTo(savedPlayed);
        setPlayed(savedPlayed);
        setPlayedSeconds(maxAllowedTime);
        playedSecondsRef.current = maxAllowedTime;
      }
    }
  }, [lessonProgress, duration]);

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    const targetTime = value * durationRef.current;
    const maxAllowedTime = maxAllowedProgressRef.current;

    // Only allow seeking to positions within the allowed progress
    if (targetTime <= maxAllowedTime) {
      setPlayed(value);
      if (playerRef.current) {
        playerRef.current.seekTo(value);
      }
    } else {
      // If trying to seek beyond allowed progress, seek to max allowed position
      const maxPlayed = maxAllowedTime / durationRef.current;
      setPlayed(maxPlayed);
      if (playerRef.current) {
        playerRef.current.seekTo(maxPlayed);
      }
    }
  };

  const saveProgress = async () => {
    const currentLessonId = lessonIdRef.current;
    const currentDuration = durationRef.current;
    const currentPlayedSeconds = playedSecondsRef.current;

    if (!currentLessonId || !currentDuration || currentDuration === 0) {
      return;
    }

    const currentProgress = Math.round(
      (currentPlayedSeconds / currentDuration) * 100,
    );

    // Only save if progress has changed significantly (at least 1%)
    if (Math.abs(currentProgress - lastSavedProgressRef.current) < 1) {
      return;
    }

    try {
      await updateLessonProgress({
        lessonId: currentLessonId,
        progress: currentProgress,
      });
      lastSavedProgressRef.current = currentProgress;
    } catch (error) {
      console.error('Error saving lesson progress:', error);
    }
  };

  const togglePlayPause = () => {
    setPlaying(!playing);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (playerWrapperRef.current?.requestFullscreen) {
        playerWrapperRef.current.requestFullscreen();
      } else if ((playerWrapperRef.current as any)?.webkitRequestFullscreen) {
        (playerWrapperRef.current as any).webkitRequestFullscreen();
      } else if ((playerWrapperRef.current as any)?.mozRequestFullScreen) {
        (playerWrapperRef.current as any).mozRequestFullScreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        (document as any).mozCancelFullScreen();
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        !!(
          document.fullscreenElement ||
          (document as any).webkitFullscreenElement ||
          (document as any).mozFullScreenElement
        ),
      );
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener(
        'webkitfullscreenchange',
        handleFullscreenChange,
      );
      document.removeEventListener(
        'mozfullscreenchange',
        handleFullscreenChange,
      );
    };
  }, []);

  const handleMouseMove = () => {
    // Controls are always visible now
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
  };

  const handleMouseLeave = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
  };

  const handleReplay = () => {
    setPlayed(0);
    setPlayedSeconds(0);
    if (playerRef.current) {
      playerRef.current.seekTo(0);
    }
    setPlaying(true);
  };

  return (
    <div
      className="lesson-video-wrapper"
      ref={playerWrapperRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="lesson-video-content-area">
        <div className="lesson-video-content-area-overlay"></div>
        <ReactPlayer
          ref={playerRef}
          url={lessonVideo?.videoUrl || ''}
          playing={playing}
          volume={volume}
          playbackRate={playbackRate}
          width="100%"
          height="100%"
          onProgress={handleProgress}
          onDuration={handleDuration}
          config={{
            youtube: {
              playerVars: {
                controls: 0,
                modestbranding: 1,
                disablekb: 1, // Disable keyboard controls
              },
            },
            file: {
              attributes: {
                controlsList: 'nodownload nofullscreen noremoteplayback',
                disablePictureInPicture: true,
              },
            },
          }}
          onSeek={seconds => {
            // Prevent seeking beyond the allowed progress from Redux
            if (playerRef.current && durationRef.current > 0) {
              const maxAllowedTime = maxAllowedProgressRef.current;

              // If user tries to seek beyond allowed progress, reset to max allowed position
              if (seconds > maxAllowedTime + 0.5) {
                const maxPlayed = maxAllowedTime / durationRef.current;
                playerRef.current.seekTo(maxPlayed);
                setPlayedSeconds(maxAllowedTime);
                setPlayed(maxPlayed);
                playedSecondsRef.current = maxAllowedTime;
              }
            }
          }}
          className="lesson-video-react-player"
        />
      </div>

      <div className={`lesson-video-control-bar lesson-video-show`}>
        <div className="lesson-video-progress-container">
          <div className="lesson-video-control-center">
            <input
              type="range"
              min={0}
              max={1}
              step="any"
              value={played}
              onChange={handleSeekChange}
              className="lesson-video-progress-bar"
              style={
                {
                  '--value': played,
                  '--max-allowed':
                    durationRef.current > 0
                      ? maxAllowedProgressRef.current / durationRef.current
                      : 1,
                } as React.CSSProperties
              }
            />
          </div>
        </div>

        <div className="lesson-video-controls-row">
          <div className="lesson-video-control-left">
            <button className="lesson-video-play-btn" onClick={togglePlayPause}>
              {playing ? (
                <PauseCircleOutlined className="lesson-video-play-icon" />
              ) : (
                <PlayCircleOutlined className="lesson-video-play-icon" />
              )}
            </button>
            <span className="lesson-video-time-display">
              {formatTime(playedSeconds)} / {formatTime(duration)}
            </span>
          </div>

          <div className="lesson-video-control-center-inline">
            <input
              type="range"
              min={0}
              max={1}
              step="any"
              value={played}
              onChange={handleSeekChange}
              className="lesson-video-progress-bar"
              style={
                {
                  '--value': played,
                  '--max-allowed':
                    durationRef.current > 0
                      ? maxAllowedProgressRef.current / durationRef.current
                      : 1,
                } as React.CSSProperties
              }
            />
          </div>

          <div className="lesson-video-control-right">
            <button
              className="lesson-video-control-btn"
              onClick={handleReplay}
              title="Phát lại"
            >
              <ReloadOutlined />
            </button>
            <button
              className="lesson-video-control-btn"
              onClick={handleReplay}
              title="Tải lại"
            >
              <ReloadOutlined />
            </button>
            <button className="lesson-video-control-btn" title="Âm lượng">
              <SoundOutlined />
            </button>
            <div className="lesson-video-speed-control">
              <select
                value={playbackRate}
                onChange={e => {
                  const rate = parseFloat(e.target.value);
                  setPlaybackRate(rate);
                  if (playerRef.current) {
                    playerRef.current
                      .getInternalPlayer()
                      ?.setPlaybackRate?.(rate);
                  }
                }}
                className="lesson-video-speed-select"
              >
                <option value={0.25}>x0.25</option>
                <option value={0.5}>x0.5</option>
                <option value={0.75}>x0.75</option>
                <option value={1}>x1</option>
                <option value={1.25}>x1.25</option>
                <option value={1.5}>x1.5</option>
                <option value={1.75}>x1.75</option>
                <option value={2}>x2</option>
              </select>
            </div>
            <button
              className="lesson-video-control-btn"
              onClick={toggleFullscreen}
              title="Toàn màn hình"
            >
              {isFullscreen ? (
                <FullscreenExitOutlined />
              ) : (
                <FullscreenOutlined />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonVideo;
