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
    let currentlyPlayingAudio = null;

    // Event Selection
    eventSelector.addEventListener('change', function() {
        selectedEvent = this.value;
        loadMediaForEvent(selectedEvent);
        loadAudioForEvent(selectedEvent);
        resetPreview();
    });

    // Load Media from directory structure
    function loadMediaForEvent(event) {
        mediaGrid.innerHTML = '<div class="loading-placeholder">Loading media...</div>';
        
        // In production: Fetch from server API or directory scan
        // For demo, we simulate loading
        setTimeout(() => {
            mediaGrid.innerHTML = `
                <div class="no-media">
                    Media files should appear here from your ${event}/images/ and ${event}/videos/ folders
                </div>
            `;
        }, 800);
    }

    // Load Audio from directory structure
    function loadAudioForEvent(event) {
        audioList.innerHTML = '<div class="loading-placeholder">Loading audio tracks...</div>';
        
        // In production: Fetch from server API or directory scan
        // For demo, we simulate loading
        setTimeout(() => {
            audioList.innerHTML = `
                <div class="no-audio">
                    Audio files should appear here from your ${event}/audio/ folder
                </div>
            `;
        }, 800);
    }

    // Create media element (for actual implementation)
    function createMediaElement(type, filePath, fileName) {
        const mediaItem = document.createElement('div');
        mediaItem.className = 'media-item';
        mediaItem.dataset.type = type;
        mediaItem.dataset.src = filePath;
        
        // Extract display name from filename (remove extension and dashes)
        const displayName = fileName.replace(/\.[^/.]+$/, "").replace(/-/g, " ");
        
        if (type === 'video') {
            mediaItem.innerHTML = `
                <video muted loop>
                    <source src="${filePath}" type="video/mp4">
                </video>
                <div class="media-icon"><i class="fas fa-play"></i></div>
                <div class="media-name">${displayName}</div>
            `;
        } else {
            mediaItem.innerHTML = `
                <img src="${filePath}" alt="${displayName}">
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
            name: element.querySelector('.media-name').textContent
        };
        updatePreview();
    }

    // Create audio element (for actual implementation)
    function createAudioElement(filePath, fileName) {
        const audioItem = document.createElement('div');
        audioItem.className = 'audio-item';
        audioItem.dataset.src = filePath;
        
        // Extract display name from filename
        const displayName = fileName.replace(/\.[^/.]+$/, "").replace(/-/g, " ");
        
        audioItem.innerHTML = `
            <div class="audio-play-btn">
                <i class="fas fa-play"></i>
            </div>
            <div class="audio-info">
                <h4>${displayName}</h4>
                <p class="audio-duration">0:00</p>
            </div>
            <div class="audio-select-check">
                <i class="fas fa-check"></i>
            </div>
        `;

        // Audio preview functionality
        const audioElement = new Audio(filePath);
        const playBtn = audioItem.querySelector('.audio-play-btn');
        const durationElement = audioItem.querySelector('.audio-duration');

        audioElement.addEventListener('loadedmetadata', function() {
            durationElement.textContent = formatDuration(audioElement.duration);
        });

        playBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleAudioPreview(audioItem, audioElement, playBtn.querySelector('i'));
        });

        audioItem.addEventListener('click', function() {
            selectAudio(this);
        });

        return audioItem;
    }

    // Toggle Audio Preview
    function toggleAudioPreview(audioItem, audioElement, playIcon) {
        if (currentlyPlayingAudio && currentlyPlayingAudio.audioElement !== audioElement) {
            currentlyPlayingAudio.audioElement.pause();
            currentlyPlayingAudio.audioElement.currentTime = 0;
            currentlyPlayingAudio.playIcon.classList.replace('fa-pause', 'fa-play');
        }

        if (audioElement.paused) {
            audioElement.play();
            playIcon.classList.replace('fa-play', 'fa-pause');
            currentlyPlayingAudio = { audioElement, playIcon };
            
            audioElement.addEventListener('ended', function() {
                playIcon.classList.replace('fa-pause', 'fa-play');
                currentlyPlayingAudio = null;
            });
        } else {
            audioElement.pause();
            audioElement.currentTime = 0;
            playIcon.classList.replace('fa-pause', 'fa-play');
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
            name: element.querySelector('h4').textContent,
            duration: element.querySelector('.audio-duration').textContent
        };
        updatePreview();
    }

    // Format Duration
    function formatDuration(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    // Update Preview
    function updatePreview() {
        previewMedia.innerHTML = '';
        
        if (mediaPlayer) {
            mediaPlayer.pause();
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

    // Play Combined Media
    playBtn.addEventListener('click', function() {
        if (!selectedMedia || !selectedAudio) {
            alert('Please select both media and audio first');
            return;
        }

        // Implementation note: 
        // In production, you would combine the media and audio here
        // This is just the UI implementation
        alert(`Would play:\nMedia: ${selectedMedia.name}\nAudio: ${selectedAudio.name}\nDuration: ${selectedAudio.duration}`);
    });

    // Download Combined Status
    downloadBtn.addEventListener('click', function() {
        if (!selectedMedia || !selectedAudio) {
            alert('Please select both media and audio first');
            return;
        }
        alert(`Would download combined status with:\nMedia: ${selectedMedia.name}\nAudio: ${selectedAudio.name}`);
    });

    // Share Status
    shareBtn.addEventListener('click', function() {
        if (!selectedMedia || !selectedAudio) {
            alert('Please select both media and audio first');
            return;
        }
        alert(`Would share:\nMedia: ${selectedMedia.name}\nAudio: ${selectedAudio.name}`);
    });

    // Reset Preview
    function resetPreview() {
        selectedMedia = null;
        selectedAudio = null;
        
        if (currentlyPlayingAudio) {
            currentlyPlayingAudio.audioElement.pause();
            currentlyPlayingAudio.audioElement.currentTime = 0;
            currentlyPlayingAudio.playIcon.classList.replace('fa-pause', 'fa-play');
            currentlyPlayingAudio = null;
        }
        
        document.querySelectorAll('.media-item, .audio-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        updatePreview();
    }
});
