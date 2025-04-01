document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const eventSelector = document.getElementById('event-selector');
    const mediaGrid = document.getElementById('media-grid');
    const audioList = document.getElementById('audio-list');
    const previewMedia = document.getElementById('preview-media');
    const playBtn = document.getElementById('play-btn');
    const downloadBtn = document.getElementById('download-btn');
    
    // State
    let selectedEvent = null;
    let selectedMedia = null;
    let selectedAudio = null;
    let mediaPlayer = null;
    let audioPlayer = null;
    let audioDuration = 0;

    // Sample media data
    const mediaData = {
        'janta-raja-2025': {
            images: [
                { id: 1, src: './assets/janta-raja-2025/images/image1.jpg' },
                { id: 2, src: './assets/janta-raja-2025/images/image2.jpg' }
            ],
            videos: [
                { id: 1, src: './assets/janta-raja-2025/videos/video1.mp4', thumbnail: './assets/janta-raja-2025/videos/thumb1.jpg' },
                { id: 2, src: './assets/janta-raja-2025/videos/video2.mp4', thumbnail: './assets/janta-raja-2025/videos/thumb2.jpg' }
            ],
            audio: [
                { id: 1, src: './assets/janta-raja-2025/audio/audio1.mp3', title: 'Devotional Song 1' },
                { id: 2, src: './assets/janta-raja-2025/audio/audio2.mp3', title: 'Devotional Song 2' }
            ]
        },
        'bharat-mata-mandir': {
            images: [],
            videos: [],
            audio: []
        }
    };

    // Event Selection
    eventSelector.addEventListener('change', function() {
        selectedEvent = this.value;
        loadMediaForEvent(selectedEvent);
        loadAudioForEvent(selectedEvent);
        resetPreview();
    });

    // Load Media
    function loadMediaForEvent(event) {
        mediaGrid.innerHTML = '';
        
        if (!mediaData[event]) return;
        
        // Add images
        mediaData[event].images.forEach(img => {
            const mediaItem = createMediaElement('image', img.src, img.id);
            mediaGrid.appendChild(mediaItem);
        });
        
        // Add videos
        mediaData[event].videos.forEach(video => {
            const mediaItem = createMediaElement('video', video.thumbnail || video.src, video.id, video.src);
            mediaGrid.appendChild(mediaItem);
        });
        
        if (mediaData[event].images.length + mediaData[event].videos.length === 0) {
            mediaGrid.innerHTML = '<div class="no-media">No media available for this event</div>';
        }
    }

    // Create media element
    function createMediaElement(type, src, id, videoSrc = null) {
        const mediaItem = document.createElement('div');
        mediaItem.className = 'media-item';
        mediaItem.dataset.type = type;
        mediaItem.dataset.id = id;
        mediaItem.dataset.src = type === 'video' ? videoSrc : src;
        
        if (type === 'video') {
            mediaItem.innerHTML = `
                <img src="${src}" alt="Video thumbnail">
                <div class="media-icon"><i class="fas fa-play"></i></div>
            `;
        } else {
            mediaItem.innerHTML = `
                <img src="${src}" alt="Event image">
                <div class="media-icon"><i class="fas fa-image"></i></div>
            `;
        }
        
        mediaItem.addEventListener('click', function() {
            selectMedia(this);
        });
        
        return mediaItem;
    }

    // Select media
    function selectMedia(element) {
        document.querySelectorAll('.media-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        element.classList.add('selected');
        selectedMedia = {
            type: element.dataset.type,
            src: element.dataset.src,
            id: element.dataset.id
        };
        updatePreview();
    }

    // Load Audio
    function loadAudioForEvent(event) {
        audioList.innerHTML = '';
        
        if (!mediaData[event]) return;
        
        mediaData[event].audio.forEach(audio => {
            const audioItem = document.createElement('div');
            audioItem.className = 'audio-item';
            audioItem.dataset.src = audio.src;
            audioItem.dataset.id = audio.id;
            
            // Create temporary audio element to get duration
            const tempAudio = new Audio(audio.src);
            tempAudio.addEventListener('loadedmetadata', function() {
                const duration = formatDuration(tempAudio.duration);
                audioItem.querySelector('.audio-info p').textContent = duration;
            });
            
            audioItem.innerHTML = `
                <i class="fas fa-music"></i>
                <div class="audio-info">
                    <h4>${audio.title}</h4>
                    <p>Loading duration...</p>
                </div>
                <i class="fas fa-check"></i>
            `;
            
            audioItem.addEventListener('click', function() {
                selectAudio(this);
            });
            
            audioList.appendChild(audioItem);
        });
        
        if (mediaData[event].audio.length === 0) {
            audioList.innerHTML = '<div class="no-audio">No audio available for this event</div>';
        }
    }

    // Format duration (seconds to MM:SS)
    function formatDuration(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    // Select audio
    function selectAudio(element) {
        document.querySelectorAll('.audio-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        element.classList.add('selected');
        selectedAudio = element.dataset.src;
        
        // Get audio duration
        if (audioPlayer) {
            audioPlayer.pause();
            audioPlayer = null;
        }
        
        audioPlayer = new Audio(selectedAudio);
        audioPlayer.addEventListener('loadedmetadata', function() {
            audioDuration = audioPlayer.duration;
            updatePreview();
        });
    }

    // Update Preview
    function updatePreview() {
        previewMedia.innerHTML = '';
        
        if (mediaPlayer) {
            mediaPlayer.pause();
            mediaPlayer = null;
        }
        
        if (selectedMedia) {
            if (selectedMedia.type === 'video') {
                mediaPlayer = document.createElement('video');
                mediaPlayer.src = selectedMedia.src;
                mediaPlayer.controls = false;
                mediaPlayer.muted = true;
                previewMedia.appendChild(mediaPlayer);
                
                // Set video duration to match audio
                if (audioDuration > 0) {
                    mediaPlayer.addEventListener('loadedmetadata', function() {
                        if (mediaPlayer.duration < audioDuration) {
                            // Loop video if shorter than audio
                            mediaPlayer.loop = true;
                        }
                    });
                }
            } else {
                const img = document.createElement('img');
                img.src = selectedMedia.src;
                img.alt = 'Selected media';
                previewMedia.appendChild(img);
            }
        } else {
            previewMedia.innerHTML = `
                <div class="placeholder">
                    <i class="fas fa-image"></i>
                    <p>Select media to preview</p>
                </div>
            `;
        }
    }

    // Play Button
    playBtn.addEventListener('click', function() {
        if (!selectedMedia) {
            alert('Please select media first');
            return;
        }
        
        if (!selectedAudio) {
            alert('Please select audio first');
            return;
        }
        
        if (selectedMedia.type === 'video' && mediaPlayer) {
            if (mediaPlayer.paused) {
                mediaPlayer.play();
                audioPlayer.play();
                playBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
                
                // Stop after audio duration
                setTimeout(() => {
                    mediaPlayer.pause();
                    audioPlayer.pause();
                    mediaPlayer.currentTime = 0;
                    audioPlayer.currentTime = 0;
                    playBtn.innerHTML = '<i class="fas fa-play"></i> Play Status';
                }, audioDuration * 1000);
            } else {
                mediaPlayer.pause();
                audioPlayer.pause();
                playBtn.innerHTML = '<i class="fas fa-play"></i> Play Status';
            }
        } else if (selectedMedia.type === 'image') {
            // For images, show slideshow for audio duration
            playBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
            audioPlayer.play();
            
            setTimeout(() => {
                audioPlayer.pause();
                audioPlayer.currentTime = 0;
                playBtn.innerHTML = '<i class="fas fa-play"></i> Play Status';
            }, audioDuration * 1000);
        }
    });

    // Download Button
    downloadBtn.addEventListener('click', function() {
        if (!selectedMedia || !selectedAudio) {
            alert('Please select both media and audio first');
            return;
        }
        
        alert(`Preparing download with:\nMedia: ${selectedMedia.src}\nAudio: ${selectedAudio}\nDuration: ${formatDuration(audioDuration)}`);
        // In real implementation, you would combine media and audio here
    });

    // Reset Preview
    function resetPreview() {
        selectedMedia = null;
        selectedAudio = null;
        audioDuration = 0;
        document.querySelectorAll('.media-item, .audio-item').forEach(item => {
            item.classList.remove('selected');
        });
        updatePreview();
    }
});
