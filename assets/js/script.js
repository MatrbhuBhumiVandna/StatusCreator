document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const eventDropdown = document.getElementById('eventDropdown');
    const mediaTabs = document.querySelectorAll('.media-tab');
    const mediaGrid = document.getElementById('mediaGrid');
    const audioList = document.getElementById('audioList');
    const previewMedia = document.getElementById('previewMedia');
    const previewAudio = new Audio();
    const currentAudioName = document.getElementById('currentAudioName');
    const resetBtn = document.getElementById('resetBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    
    // Current selections
    let currentEvent = 'janta-raja-2025';
    let currentMediaTab = 'images';
    let selectedMedia = null;
    let selectedAudio = null;
    
    // Sample data - update with your actual filenames
    const mediaData = {
        'janta-raja-2025': {
            images: ['image1.jpg', 'image2.jpg', 'image3.jpg'],
            videos: ['video1.mp4', 'video2.mp4']
        },
        'bharat-mata-mandir': {
            images: ['temple1.jpg', 'temple2.jpg'],
            videos: ['construction.mp4']
        }
    };
    
    const audioData = {
        'janta-raja-2025': ['bhajan1.mp3', 'bhajan2.mp3', 'speech.mp3'],
        'bharat-mata-mandir': ['aarti.mp3', 'chanting.mp3']
    };
    
    // Initialize the app
    function init() {
        loadMedia();
        loadAudio();
        setupEventListeners();
        setDefaultSelections();
    }
    
    // Set default selections
    function setDefaultSelections() {
        // Set first image as default
        if (mediaData[currentEvent].images.length > 0) {
            selectMedia(mediaData[currentEvent].images[0], 'images');
        }
        
        // Set first audio as default
        if (audioData[currentEvent].length > 0) {
            selectAudio(audioData[currentEvent][0]);
        }
    }
    
    // Get media path for GitHub Pages
    function getMediaPath(event, type, filename) {
        return `assets/media/${event}/${type}/${filename}`;
    }
    
    // Load media for current event
    function loadMedia() {
        mediaGrid.innerHTML = '';
        const mediaItems = mediaData[currentEvent][currentMediaTab];
        
        mediaItems.forEach(item => {
            const mediaItem = document.createElement('div');
            mediaItem.className = 'media-item';
            mediaItem.dataset.name = item;
            
            if (currentMediaTab === 'images') {
                mediaItem.innerHTML = `
                    <img src="${getMediaPath(currentEvent, 'images', item)}" alt="${item}">
                    <div class="media-type-icon"><i class="fas fa-image"></i></div>
                `;
            } else {
                mediaItem.innerHTML = `
                    <video>
                        <source src="${getMediaPath(currentEvent, 'videos', item)}" type="video/mp4">
                    </video>
                    <div class="media-type-icon"><i class="fas fa-video"></i></div>
                `;
            }
            
            mediaItem.addEventListener('click', () => {
                selectMedia(item, currentMediaTab);
            });
            
            mediaGrid.appendChild(mediaItem);
        });
    }
    
    // Load audio for current event
    function loadAudio() {
        audioList.innerHTML = '';
        const audioItems = audioData[currentEvent];
        
        audioItems.forEach(item => {
            const audioItem = document.createElement('div');
            audioItem.className = 'audio-item';
            audioItem.dataset.name = item;
            
            audioItem.innerHTML = `
                <i class="fas fa-music"></i>
                <div class="audio-name">${item}</div>
                <div class="play-btn"><i class="fas fa-play"></i></div>
            `;
            
            audioItem.addEventListener('click', () => {
                selectAudio(item);
            });
            
            // Play button functionality
            const playBtn = audioItem.querySelector('.play-btn');
            playBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleAudioPlayback(item);
            });
            
            audioList.appendChild(audioItem);
        });
    }
    
    // Select media item
    function selectMedia(mediaName, mediaType) {
        selectedMedia = {
            name: mediaName,
            type: mediaType
        };
        
        // Update UI
        document.querySelectorAll('.media-item').forEach(item => {
            item.classList.remove('selected');
            if (item.dataset.name === mediaName) {
                item.classList.add('selected');
            }
        });
        
        // Update preview
        if (mediaType === 'images') {
            previewMedia.src = getMediaPath(currentEvent, 'images', mediaName);
            previewMedia.style.display = 'block';
            // Hide video element if it exists
            const videoElement = document.querySelector('.preview-container video');
            if (videoElement) videoElement.style.display = 'none';
        } else {
            previewMedia.style.display = 'none';
            let videoElement = document.querySelector('.preview-container video');
            if (!videoElement) {
                videoElement = document.createElement('video');
                videoElement.className = 'preview-media';
                videoElement.controls = false;
                videoElement.autoplay = true;
                videoElement.loop = true;
                document.querySelector('.preview-container').prepend(videoElement);
            } else {
                videoElement.style.display = 'block';
            }
            videoElement.src = getMediaPath(currentEvent, 'videos', mediaName);
        }
    }
    
    // Select audio item
    function selectAudio(audioName) {
        selectedAudio = audioName;
        
        // Update UI
        document.querySelectorAll('.audio-item').forEach(item => {
            item.classList.remove('selected');
            if (item.dataset.name === audioName) {
                item.classList.add('selected');
            }
        });
        
        // Update preview
        currentAudioName.textContent = audioName;
        previewAudio.src = getMediaPath(currentEvent, 'audio', audioName);
        
        // Automatically play the audio when selected
        previewAudio.play().catch(e => {
            console.log("Audio playback failed:", e);
        });
        
        // Update play button icon to pause when playing
        const playBtns = document.querySelectorAll('.play-btn i');
        playBtns.forEach(btn => {
            if (btn.closest('.audio-item').dataset.name === audioName) {
                btn.classList.remove('fa-play');
                btn.classList.add('fa-pause');
            } else {
                btn.classList.remove('fa-pause');
                btn.classList.add('fa-play');
            }
        });
    }
    
    // Toggle audio playback
    function toggleAudioPlayback(audioName) {
        if (selectedAudio === audioName && !previewAudio.paused) {
            previewAudio.pause();
            document.querySelector(`.audio-item[data-name="${audioName}"] .play-btn i`)
                .classList.replace('fa-pause', 'fa-play');
        } else {
            selectAudio(audioName);
        }
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Event dropdown change
        eventDropdown.addEventListener('change', () => {
            currentEvent = eventDropdown.value;
            loadMedia();
            loadAudio();
            setDefaultSelections();
        });
        
        // Media tabs click
        mediaTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                mediaTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                currentMediaTab = tab.dataset.tab;
                loadMedia();
            });
        });
        
        // Reset button
        resetBtn.addEventListener('click', () => {
            setDefaultSelections();
        });
        
        // Download button
        downloadBtn.addEventListener('click', () => {
            if (!selectedMedia || !selectedAudio) {
                alert('Please select both media and audio');
                return;
            }
            
            // For GitHub Pages - download the media file directly
            const link = document.createElement('a');
            if (selectedMedia.type === 'images') {
                link.href = getMediaPath(currentEvent, 'images', selectedMedia.name);
                link.download = `status-${Date.now()}.jpg`;
            } else {
                link.href = getMediaPath(currentEvent, 'videos', selectedMedia.name);
                link.download = `status-${Date.now()}.mp4`;
            }
            link.click();
            
            // Note: Audio will need to be downloaded separately
            const audioLink = document.createElement('a');
            audioLink.href = getMediaPath(currentEvent, 'audio', selectedAudio);
            audioLink.download = `audio-${Date.now()}.mp3`;
            audioLink.click();
        });
        
        // Handle audio ending to reset play button
        previewAudio.addEventListener('ended', () => {
            const playBtns = document.querySelectorAll('.play-btn i');
            playBtns.forEach(btn => {
                btn.classList.replace('fa-pause', 'fa-play');
            });
        });
    }
    
    // Initialize the app
    init();
});
