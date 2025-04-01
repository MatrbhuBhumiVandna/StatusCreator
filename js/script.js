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
    let currentlyPlayingAudio = null;

    // Sample media data - will be populated from file names
    const mediaData = {
        'janta-raja-2025': {
            images: [],
            videos: [],
            audio: []
        },
        'bharat-mata-mandir': {
            images: [],
            videos: [],
            audio: []
        }
    };

    // Initialize
    initEventData();

    // Event Selection
    eventSelector.addEventListener('change', function() {
        selectedEvent = this.value;
        loadMediaForEvent(selectedEvent);
        loadAudioForEvent(selectedEvent);
        resetPreview();
    });

    // Populate media data from file names
    function initEventData() {
        // In a real app, you would scan your directories here
        // For demo, we'll simulate finding files
        
        // Janta Raja 2025
        mediaData['janta-raja-2025'].images = [
            { filename: 'janmastami-celebration.jpg', displayName: 'Janmastami Celebration' },
            { filename: 'procession.jpg', displayName: 'Grand Procession' }
        ];
        
        mediaData['janta-raja-2025'].videos = [
            { filename: 'cultural-performance.mp4', displayName: 'Cultural Performance', thumbnail: 'cultural-performance-thumb.jpg' },
            { filename: 'aarti-ceremony.mp4', displayName: 'Aarti Ceremony', thumbnail: 'aarti-thumb.jpg' }
        ];
        
        mediaData['janta-raja-2025'].audio = [
            { filename: 'bhajan-jai-shri-ram.mp3', displayName: 'Bhajan: Jai Shri Ram' },
            { filename: 'aarti-om-jai-jagdish.mp3', displayName: 'Aarti: Om Jai Jagdish' },
            { filename: 'speech-by-priest.mp3', displayName: 'Speech by Head Priest' }
        ];
        
        // Bharat Mata Mandir
        mediaData['bharat-mata-mandir'].images = [
            { filename: 'temple-construction.jpg', displayName: 'Temple Construction' },
            { filename: 'foundation-ceremony.jpg', displayName: 'Foundation Ceremony' }
        ];
    }

    // Load Media
    function loadMediaForEvent(event) {
        mediaGrid.innerHTML = '';
        
        if (!mediaData[event]) return;
        
        // Add images
        mediaData[event].images.forEach(img => {
            const mediaItem = createMediaElement(
                'image', 
                `./assets/${event}/images/${img.filename}`,
                img.filename,
                img.displayName
            );
            mediaGrid.appendChild(mediaItem);
        });
        
        // Add videos
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
        
        if (mediaData[event].images.length + mediaData[event].videos.length === 0) {
            mediaGrid.innerHTML = '<div class="no-media">No media available for this event</div>';
        }
    }

    // Create media element
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

    // Select media
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

    // Load Audio
    function loadAudioForEvent(event) {
        audioList.innerHTML = '';
        
        if (!mediaData[event]) return;
        
        mediaData[event].audio.forEach(audio => {
            const audioItem = document.createElement('div');
            audioItem.className = 'audio-item';
            audioItem.dataset.src = `./assets/${event}/audio/${audio.filename}`;
            audioItem.dataset.id = audio.filename;
            audioItem.dataset.displayName = audio.displayName;
            
            audioItem.innerHTML = `
                <div class="audio-play-btn">
                    <i class="fas fa-play"></i>
                </div>
                <div class="audio-info">
                    <h4>${audio.displayName}</h4>
                    <p class="audio-duration">Loading...</p>
                </div>
                <div class="audio-select-check">
                    <i class="fas fa-check"></i>
                </div>
            `;
            
            // Add play/pause functionality
            const playBtn = audioItem.querySelector('.audio-play-btn');
            const audioElement = new Audio(audioItem.dataset.src);
            
            playBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                toggleAudioPreview(audioItem, audioElement);
            });
            
            // Get duration when loaded
            audioElement.addEventListener('loadedmetadata', function() {
                const duration = formatDuration(audioElement.duration);
                audioItem.querySelector('.audio-duration').textContent = duration;
            });
            
            audioItem.addEventListener('click', function() {
                selectAudio(this);
            });
            
            audioList.appendChild(audioItem);
        });
        
        if (mediaData[event].audio.length === 0) {
            audioList.innerHTML = '<div class="no-audio">No audio available for this event</div>';
        }
    }

    // Toggle audio preview
    function toggleAudioPreview(audioItem, audioElement) {
        const playIcon = audioItem.querySelector('.audio-play-btn i');
        
        if (currentlyPlayingAudio && currentlyPlayingAudio.audioElement !== audioElement) {
            // Stop other playing audio
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
            });
        } else {
            audioElement.pause();
            audioElement.currentTime = 0;
            playIcon.classList.remove('fa-pause');
            playIcon.classList.add('fa-play');
            currentlyPlayingAudio = null;
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
        selectedAudio = {
            src: element.dataset.src,
            id: element.dataset.id,
            name: element.dataset.displayName,
            duration: element.querySelector('.audio-duration').textContent
        };
        updatePreview();
    }

    // Update Preview
    function updatePreview() {
        previewMedia.innerHTML = '';
        
        if (mediaPlayer) {
            mediaPlayer.pause();
            mediaPlayer = null;
        }
        
        if (selectedMedia) {
            const previewContainer = document.createElement('div');
            previewContainer.className = 'preview-content';
            
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
            
            previewMedia.appendChild(previewContainer);
        } else {
            previewMedia.innerHTML = `
                <div class="placeholder">
                    <i class="fas fa-image"></i>
                    <p>Select media to preview</p>
                </div>
            `;
        }
        
        // Update audio info if selected
        if (selectedAudio) {
            const audioInfo = document.createElement('div');
            audioInfo.className = 'preview-audio-info';
            audioInfo.innerHTML = `
                <i class="fas fa-music"></i>
                <span>${selectedAudio.name}</span>
                <span class="audio-duration">${selectedAudio.duration}</span>
            `;
            previewMedia.appendChild(audioInfo);
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
        
        // Create audio element for playback
        const audioElement = new Audio(selectedAudio.src);
        
        if (selectedMedia.type === 'video' && mediaPlayer) {
            if (mediaPlayer.paused) {
                mediaPlayer.play();
                audioElement.play();
                playBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
                
                audioElement.addEventListener('ended', function() {
                    mediaPlayer.pause();
                    mediaPlayer.currentTime = 0;
                    playBtn.innerHTML = '<i class="fas fa-play"></i> Play Status';
                });
            } else {
                mediaPlayer.pause();
                mediaPlayer.currentTime = 0;
                audioElement.pause();
                playBtn.innerHTML = '<i class="fas fa-play"></i> Play Status';
            }
        } else if (selectedMedia.type === 'image') {
            // For images, show for audio duration
            playBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
            audioElement.play();
            
            audioElement.addEventListener('ended', function() {
                playBtn.innerHTML = '<i class="fas fa-play"></i> Play Status';
            });
        }
    });

    // Download Button
    downloadBtn.addEventListener('click', function() {
        if (!selectedMedia || !selectedAudio) {
            alert('Please select both media and audio first');
            return;
        }
        
        alert(`Preparing download with:
Media: ${selectedMedia.name}
Audio: ${selectedAudio.name}
Duration: ${selectedAudio.duration}`);
    });

    // Reset Preview
    function resetPreview() {
        selectedMedia = null;
        selectedAudio = null;
        document.querySelectorAll('.media-item, .audio-item').forEach(item => {
            item.classList.remove('selected');
        });
        updatePreview();
    }
});
