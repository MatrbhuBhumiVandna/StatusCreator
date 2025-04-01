document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const eventSelector = document.getElementById('event-selector');
    const mediaGrid = document.getElementById('media-grid');
    const audioList = document.getElementById('audio-list');
    const previewMedia = document.getElementById('preview-media');
    const playBtn = document.getElementById('play-btn');
    
    // State
    let selectedEvent = null;
    let selectedMedia = null;
    let selectedAudio = null;
    let mediaPlayer = null;
    
    // Sample media data (replace with actual API calls in production)
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
                { id: 1, src: './assets/janta-raja-2025/audio/audio1.mp3', title: 'Devotional Song 1', duration: '60s' },
                { id: 2, src: './assets/janta-raja-2025/audio/audio2.mp3', title: 'Devotional Song 2', duration: '60s' }
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
        
        // Show loading state
        mediaGrid.innerHTML = '<div class="loading-placeholder">Loading media...</div>';
        
        // Simulate loading delay
        setTimeout(() => {
            mediaGrid.innerHTML = '';
            
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
        }, 800);
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
        
        // Show loading state
        audioList.innerHTML = '<div class="loading-placeholder">Loading audio...</div>';
        
        // Simulate loading delay
        setTimeout(() => {
            audioList.innerHTML = '';
            
            mediaData[event].audio.forEach(audio => {
                const audioItem = document.createElement('div');
                audioItem.className = 'audio-item';
                audioItem.dataset.src = audio.src;
                audioItem.dataset.id = audio.id;
                
                audioItem.innerHTML = `
                    <i class="fas fa-music"></i>
                    <div class="audio-info">
                        <h4>${audio.title}</h4>
                        <p>${audio.duration}</p>
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
        }, 800);
    }
    
    // Select audio
    function selectAudio(element) {
        document.querySelectorAll('.audio-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        element.classList.add('selected');
        selectedAudio = element.dataset.src;
        updatePreview();
    }
    
    // Update Preview
    function updatePreview() {
        // Clear previous preview
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
                mediaPlayer.loop = true;
                previewMedia.appendChild(mediaPlayer);
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
    
    // Reset Preview
    function resetPreview() {
        selectedMedia = null;
        selectedAudio = null;
        document.querySelectorAll('.media-item, .audio-item').forEach(item => {
            item.classList.remove('selected');
        });
        updatePreview();
    }
    
    // Play Button
    playBtn.addEventListener('click', function() {
        if (!selectedMedia) {
            alert('Please select media first');
            return;
        }
        
        if (selectedMedia.type === 'video' && mediaPlayer) {
            if (mediaPlayer.paused) {
                mediaPlayer.play();
                playBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
            } else {
                mediaPlayer.pause();
                playBtn.innerHTML = '<i class="fas fa-play"></i> Play Status';
            }
        } else {
            // For images, show fullscreen preview
            alert('Playing the selected media with audio');
        }
    });
    
    // Initialize
    loadMediaForEvent('janta-raja-2025');
    loadAudioForEvent('janta-raja-2025');
});
