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
    
    // Event Selection
    eventSelector.addEventListener('change', function() {
        selectedEvent = this.value;
        loadMediaForEvent(selectedEvent);
        loadAudioForEvent(selectedEvent);
        resetPreview();
    });
    
    // Load Media for Selected Event
    function loadMediaForEvent(event) {
        // In a real app, this would fetch from server based on event
        // For demo, we'll use placeholder data
        mediaGrid.innerHTML = '';
        
        // Simulate loading
        for (let i = 0; i < 6; i++) {
            const mediaItem = document.createElement('div');
            mediaItem.className = 'media-item loading';
            mediaGrid.appendChild(mediaItem);
        }
        
        // Simulate API delay
        setTimeout(() => {
            mediaGrid.innerHTML = '';
            
            // Add sample images (2) and videos (4) - in real app these would come from your folders
            for (let i = 1; i <= 6; i++) {
                const isVideo = i % 2 === 0;
                const mediaItem = document.createElement('div');
                mediaItem.className = 'media-item';
                mediaItem.dataset.type = isVideo ? 'video' : 'image';
                mediaItem.dataset.src = isVideo ? 
                    `assets/${event}/videos/video${i/2}.mp4` : 
                    `assets/${event}/images/image${Math.ceil(i/2)}.jpg`;
                
                if (isVideo) {
                    const video = document.createElement('video');
                    video.src = `assets/${event}/videos/video${i/2}.mp4`;
                    video.muted = true;
                    video.loop = true;
                    mediaItem.appendChild(video);
                    
                    const icon = document.createElement('div');
                    icon.className = 'media-icon';
                    icon.innerHTML = '<i class="fas fa-play"></i>';
                    mediaItem.appendChild(icon);
                } else {
                    const img = document.createElement('img');
                    img.src = `assets/${event}/images/image${Math.ceil(i/2)}.jpg`;
                    img.alt = `Event Image ${Math.ceil(i/2)}`;
                    mediaItem.appendChild(img);
                    
                    const icon = document.createElement('div');
                    icon.className = 'media-icon';
                    icon.innerHTML = '<i class="fas fa-image"></i>';
                    mediaItem.appendChild(icon);
                }
                
                mediaItem.addEventListener('click', function() {
                    // Remove selected class from all
                    document.querySelectorAll('.media-item').forEach(item => {
                        item.classList.remove('selected');
                    });
                    
                    // Add to clicked item
                    this.classList.add('selected');
                    selectedMedia = {
                        type: this.dataset.type,
                        src: this.dataset.src
                    };
                    updatePreview();
                });
                
                mediaGrid.appendChild(mediaItem);
            }
        }, 1000);
    }
    
    // Load Audio for Selected Event
    function loadAudioForEvent(event) {
        // In a real app, this would fetch from server based on event
        // For demo, we'll use placeholder data
        audioList.innerHTML = '';
        
        // Simulate loading
        for (let i = 0; i < 3; i++) {
            const audioItem = document.createElement('div');
            audioItem.className = 'audio-item loading';
            audioList.appendChild(audioItem);
        }
        
        // Simulate API delay
        setTimeout(() => {
            audioList.innerHTML = '';
            
            // Add sample audio tracks - in real app these would come from your folders
            for (let i = 1; i <= 3; i++) {
                const audioItem = document.createElement('div');
                audioItem.className = 'audio-item';
                audioItem.dataset.src = `assets/${event}/audio/audio${i}.mp3`;
                
                audioItem.innerHTML = `
                    <i class="fas fa-music"></i>
                    <div class="audio-info">
                        <h4>Audio Track ${i}</h4>
                        <p>60 seconds</p>
                    </div>
                    <i class="fas fa-check"></i>
                `;
                
                audioItem.addEventListener('click', function() {
                    // Remove selected class from all
                    document.querySelectorAll('.audio-item').forEach(item => {
                        item.classList.remove('selected');
                    });
                    
                    // Add to clicked item
                    this.classList.add('selected');
                    selectedAudio = this.dataset.src;
                    updatePreview();
                });
                
                audioList.appendChild(audioItem);
            }
        }, 1000);
    }
    
    // Update Preview
    function updatePreview() {
        previewMedia.innerHTML = '';
        
        if (selectedMedia) {
            if (selectedMedia.type === 'video') {
                const video = document.createElement('video');
                video.src = selectedMedia.src;
                video.controls = false;
                video.autoplay = false;
                video.muted = false;
                video.style.width = '100%';
                video.style.height = '100%';
                video.style.objectFit = 'cover';
                previewMedia.appendChild(video);
            } else {
                const img = document.createElement('img');
                img.src = selectedMedia.src;
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'cover';
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
            alert('Please select a photo or video first');
            return;
        }
        
        const mediaElement = previewMedia.querySelector('video, img');
        
        if (mediaElement && mediaElement.tagName === 'VIDEO') {
            if (mediaElement.paused) {
                mediaElement.play();
                playBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
            } else {
                mediaElement.pause();
                playBtn.innerHTML = '<i class="fas fa-play"></i> Play Status';
            }
        } else {
            // For images, we can't "play" but could animate or show fullscreen
            alert('Playing the selected media');
        }
    });
    
    // Download Button
    downloadBtn.addEventListener('click', function() {
        if (!selectedMedia) {
            alert('Please select a photo or video first');
            return;
        }
        
        // In a real app, this would combine media and audio and trigger download
        alert('Download functionality would combine the selected media and audio and download it');
    });
    
    // Share Button
    shareBtn.addEventListener('click', function() {
        if (!selectedMedia) {
            alert('Please select a photo or video first');
            return;
        }
        
        // In a real app, this would use the Web Share API or social media SDKs
        alert('Share functionality would share the combined status to social media');
    });
});
