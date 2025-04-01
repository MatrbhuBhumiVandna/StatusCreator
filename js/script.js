document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const eventSelector = document.getElementById('event-selector');
    const mediaGrid = document.getElementById('media-grid');
    const audioList = document.getElementById('audio-list');
    const previewMedia = document.getElementById('preview-media');
    const playBtn = document.getElementById('play-btn');
    const downloadBtn = document.getElementById('download-btn');
    const shareBtn = document.getElementById('share-btn');
    
    // State
    let selectedEvent = null;
    let selectedMedia = null;
    let selectedAudio = null;
    let mediaPlayer = null;
    let audioPlayer = null;
    let currentlyPlayingAudio = null;

    // Initialize with sample data
    const mediaData = {
        'janta-raja-2025': {
            images: [
                { filename: 'janmastami-celebration.jpg', displayName: 'Janmastami Celebration' },
                { filename: 'procession.jpg', displayName: 'Grand Procession' }
            ],
            videos: [
                { filename: 'cultural-performance.mp4', displayName: 'Cultural Performance', thumbnail: 'cultural-thumb.jpg' },
                { filename: 'aarti-ceremony.mp4', displayName: 'Aarti Ceremony', thumbnail: 'aarti-thumb.jpg' }
            ],
            audio: [
                { filename: 'bhajan-jai-shri-ram.mp3', displayName: 'Bhajan: Jai Shri Ram' },
                { filename: 'aarti-om-jai-jagdish.mp3', displayName: 'Aarti: Om Jai Jagdish' },
                { filename: 'speech-by-priest.mp3', displayName: 'Speech by Head Priest' }
            ]
        },
        'bharat-mata-mandir': {
            images: [
                { filename: 'temple-construction.jpg', displayName: 'Temple Construction' },
                { filename: 'foundation-ceremony.jpg', displayName: 'Foundation Ceremony' }
            ],
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

    // Load Media for Selected Event
    function loadMediaForEvent(event) {
        mediaGrid.innerHTML = '';
        
        if (!mediaData[event] || (mediaData[event].images.length === 0 && mediaData[event].videos.length === 0)) {
            mediaGrid.innerHTML = '<div class="no-media">No media available for this event</div>';
            return;
        }

        // Load images
        mediaData[event].images.forEach(image => {
            const mediaItem = createMediaElement(
                'image',
                `./assets/${event}/images/${image.filename}`,
                image.filename,
                image.displayName
            );
            mediaGrid.appendChild(mediaItem);
        });

        // Load videos
        mediaData[event].videos.forEach(video => {
            const mediaItem = createMediaElement(
                'video',
                `./assets/${event}/videos/${video.thumbnail || video.filename}`,
                video.filename,
                video.displayName,
                `./assets/${event}/videos/${video.filename}`
            );
            mediaGrid.appendChild(mediaItem);
        });
    }

    // Create Media Element
    function createMediaElement(type, src, id, displayName, videoSrc = null) {
        const mediaItem = document.createElement('div');
        mediaItem.className = 'media-item';
        mediaItem.dataset.type = type;
        mediaItem.dataset.id = id;
        mediaItem.dataset.src = type === 'video' ? videoSrc : src;
        mediaItem.dataset.displayName = displayName;

        if (type === 'video') {
            mediaItem.innerHTML = `
                <img src="${src}" alt="${displayName}">
                <div class="media-icon"><i class="fas fa-play"></i></div>
                <div class="media-name">${displayName}</div>
            `;
        } else {
            mediaItem.innerHTML = `
                <img src="${src}" alt="${displayName}">
                <div class="media-icon"><i class="fas fa-image"></i></div>
                <div class="media-name">${displayName}</div>
            `;
        }

        mediaItem.addEventListener('click', function() {
            selectMedia(this);
        });

        return mediaItem;
    }

    // Select Media
    function selectMedia(element) {
        document.querySelectorAll('.media-item').forEach(item => {
            item.classList.remove('selected');
        });

        element.classList.add('selected');
        selectedMedia = {
            type: element.dataset.type,
            src: element.dataset.src,
            id: element.dataset.id,
            name: element.dataset.displayName
        };
        updatePreview();
    }

    // Load Audio for Selected Event
    function loadAudioForEvent(event) {
        audioList.innerHTML = '';
        
        if (!mediaData[event] || mediaData[event].audio.length === 0) {
            audioList.innerHTML = '<div class="no-audio">No audio available for this event</div>';
            return;
        }

        mediaData[event].audio.forEach(audio => {
            const audioItem = createAudioElement(
                `./assets/${event}/audio/${audio.filename}`,
                audio.filename,
                audio.displayName
            );
            audioList.appendChild(audioItem);
        });
    }

    // Create Audio Element with Play Button
    function createAudioElement(src, id, displayName) {
        const audioItem = document.createElement('div');
        audioItem.className = 'audio-item';
        audioItem.dataset.src = src;
        audioItem.dataset.id = id;
        audioItem.dataset.displayName = displayName;

        audioItem.innerHTML = `
            <div class="audio-play-btn">
                <i class="fas fa-play"></i>
            </div>
            <div class="audio-info">
                <h4>${displayName}</h4>
                <p class="audio-duration">Loading...</p>
            </div>
            <div class="audio-select-check">
                <i class="fas fa-check"></i>
            </div>
        `;

        // Set up audio element for preview
        const audioElement = new Audio(src);
        const playBtn = audioItem.querySelector('.audio-play-btn');
        const durationElement = audioItem.querySelector('.audio-duration');

        // Load duration when metadata is available
        audioElement.addEventListener('loadedmetadata', function() {
            durationElement.textContent = formatDuration(audioElement.duration);
        });

        // Play/Pause functionality
        playBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleAudioPreview(audioItem, audioElement, playBtn.querySelector('i'));
        });

        // Select audio track
        audioItem.addEventListener('click', function() {
            selectAudio(this);
        });

        return audioItem;
    }

    // Toggle Audio Preview
    function toggleAudioPreview(audioItem, audioElement, playIcon) {
        // Stop any currently playing audio
        if (currentlyPlayingAudio && currentlyPlayingAudio.audioElement !== audioElement) {
            currentlyPlayingAudio.audioElement.pause();
            currentlyPlayingAudio.audioElement.currentTime = 0;
            currentlyPlayingAudio.playIcon.classList.remove('fa-pause');
            currentlyPlayingAudio.playIcon.classList.add('fa-play');
        }

        if (audioElement.paused) {
            audioElement.play();
            playIcon.classList.remove('fa-play');
            playIcon.classList.add('fa-pause');
            currentlyPlayingAudio = { audioElement, playIcon };
            
            audioElement.addEventListener('ended', function() {
                playIcon.classList.remove('fa-pause');
                playIcon.classList.add('fa-play');
                currentlyPlayingAudio = null;
            });
        } else {
            audioElement.pause();
            audioElement.currentTime = 0;
            playIcon.classList.remove('fa-pause');
            playIcon.classList.add('fa-play');
            currentlyPlayingAudio = null;
        }
    }

    // Select Audio
    function selectAudio(element) {
        document.querySelectorAll('.audio-item').forEach(item => {
            item.classList.remove('selected');
        });

        element.classList.add('selected');
        selectedAudio = {
            src: element.dataset.src,
            id: element.dataset.id,
            name: element.dataset.displayName,
            duration: element.querySelector('.audio-duration').textContent
        };
        updatePreview();
    }

    // Format Duration (seconds to MM:SS)
    function formatDuration(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    // Update Preview
    function updatePreview() {
        previewMedia.innerHTML = '';
        
        // Clear any existing players
        if (mediaPlayer) {
            mediaPlayer.pause();
            mediaPlayer.remove();
            mediaPlayer = null;
        }

        if (!selectedMedia) {
            previewMedia.innerHTML = `
                <div class="placeholder">
                    <i class="fas fa-image"></i>
                    <p>Select media to preview</p>
                </div>
            `;
            return;
        }

        // Create preview container
        const previewContainer = document.createElement('div');
        previewContainer.className = 'preview-content';

        // Add media (image or video)
        if (selectedMedia.type === 'video') {
            mediaPlayer = document.createElement('video');
            mediaPlayer.src = selectedMedia.src;
            mediaPlayer.controls = false;
            mediaPlayer.muted = true;
            previewContainer.appendChild(mediaPlayer);
        } else {
            const img = document.createElement('img');
            img.src = selectedMedia.src;
            img.alt = selectedMedia.name;
            previewContainer.appendChild(img);
        }

        // Add media name
        const nameDisplay = document.createElement('div');
        nameDisplay.className = 'preview-media-name';
        nameDisplay.textContent = selectedMedia.name;
        previewContainer.appendChild(nameDisplay);

        // Add audio info if selected
        if (selectedAudio) {
            const audioInfo = document.createElement('div');
            audioInfo.className = 'preview-audio-info';
            audioInfo.innerHTML = `
                <i class="fas fa-music"></i>
                <span>${selectedAudio.name}</span>
                <span class="audio-duration">${selectedAudio.duration}</span>
            `;
            previewContainer.appendChild(audioInfo);
        }

        previewMedia.appendChild(previewContainer);
    }

    // Play Button - Combine Media and Audio
    playBtn.addEventListener('click', function() {
        if (!selectedMedia) {
            alert('Please select media first');
            return;
        }
        
        if (!selectedAudio) {
            alert('Please select audio first');
            return;
        }

        // Stop any currently playing previews
        if (currentlyPlayingAudio) {
            currentlyPlayingAudio.audioElement.pause();
            currentlyPlayingAudio.audioElement.currentTime = 0;
            currentlyPlayingAudio.playIcon.classList.remove('fa-pause');
            currentlyPlayingAudio.playIcon.classList.add('fa-play');
            currentlyPlayingAudio = null;
        }

        // Create new audio player for the selected audio
        audioPlayer = new Audio(selectedAudio.src);

        if (selectedMedia.type === 'video' && mediaPlayer) {
            if (mediaPlayer.paused) {
                // Play video with audio
                mediaPlayer.play();
                audioPlayer.play();
                playBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
                
                // When audio ends, stop both
                audioPlayer.addEventListener('ended', function() {
                    mediaPlayer.pause();
                    mediaPlayer.currentTime = 0;
                    playBtn.innerHTML = '<i class="fas fa-play"></i> Play Status';
                });
            } else {
                // Pause both
                mediaPlayer.pause();
                mediaPlayer.currentTime = 0;
                audioPlayer.pause();
                playBtn.innerHTML = '<i class="fas fa-play"></i> Play Status';
            }
        } else if (selectedMedia.type === 'image') {
            // For images, play audio only
            if (audioPlayer.paused) {
                audioPlayer.play();
                playBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
                
                audioPlayer.addEventListener('ended', function() {
                    playBtn.innerHTML = '<i class="fas fa-play"></i> Play Status';
                });
            } else {
                audioPlayer.pause();
                audioPlayer.currentTime = 0;
                playBtn.innerHTML = '<i class="fas fa-play"></i> Play Status';
            }
        }
    });

    // Download Button
    downloadBtn.addEventListener('click', function() {
        if (!selectedMedia || !selectedAudio) {
            alert('Please select both media and audio first');
            return;
        }
        
        // In a real implementation, this would combine the media and audio
        alert(`Preparing download with:
Media: ${selectedMedia.name}
Audio: ${selectedAudio.name}
Duration: ${selectedAudio.duration}`);
        
        // For actual implementation, you would need to:
        // 1. Combine the video/image with audio server-side
        // 2. Provide the download link
    });

    // Share Button
    shareBtn.addEventListener('click', function() {
        if (!selectedMedia || !selectedAudio) {
            alert('Please select both media and audio first');
            return;
        }
        
        // Basic implementation - would use Web Share API in production
        alert(`Sharing status:
Media: ${selectedMedia.name}
Audio: ${selectedAudio.name}
Duration: ${selectedAudio.duration}`);
    });

    // Reset Preview
    function resetPreview() {
        selectedMedia = null;
        selectedAudio = null;
        
        // Stop any playing audio previews
        if (currentlyPlayingAudio) {
            currentlyPlayingAudio.audioElement.pause();
            currentlyPlayingAudio.audioElement.currentTime = 0;
            currentlyPlayingAudio.playIcon.classList.remove('fa-pause');
            currentlyPlayingAudio.playIcon.classList.add('fa-play');
            currentlyPlayingAudio = null;
        }
        
        document.querySelectorAll('.media-item, .audio-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        updatePreview();
    }

    // Initialize with first event
    loadMediaForEvent('janta-raja-2025');
    loadAudioForEvent('janta-raja-2025');
});
