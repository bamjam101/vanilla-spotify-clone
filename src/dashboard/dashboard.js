import { fetchRequest } from "../api";
import { ENDPOINT, getItemInLocalStorage, LOADED_TRACKS, logout, SECTIONTYPE, setItemInLocalStorage } from "../common";
const CURRENT_URL = import.meta.env.VITE_APP_URL;

const audio = new Audio();
const playBtn = document.querySelector("#play-audio");
let trackIndex;
let trackInfoObject;

const formatDuration = (duration) => {
    const min = Math.floor(duration / 60000);
    const sec = ((duration % 6000) / 1000).toFixed(0);
    const formattedDuration = sec == 60 ? min + 1 + ":00" : min + ":" + (sec < 10 ? "0" : "") + sec;
    return formattedDuration;
}

const onProfileButtonClicked = (event) => {
    event.stopPropagation();
    const profileMenu = document.querySelector("#profile-menu");
    profileMenu.classList.toggle("hidden");
    if (!profileMenu.classList.contains("hidden")) {
        profileMenu.querySelector("li#logout-btn").addEventListener('click', logout);
    }
}

const onPlaylistItemClicked = (event, id) => {
    const section = { type: SECTIONTYPE.PLAYLIST, playlist: id };
    history.pushState(section, "", `playlist/${id}`);
    loadSection(section);
}

const loadUserProfile = async (event) => {
    const defaultImage = document.querySelector("#default-profile");
    const profileBtn = document.querySelector("#profile-btn");
    const displayUsername = document.querySelector("#username");

    const { display_name: username, images } = await fetchRequest(ENDPOINT.userInfo);
    displayUsername.innerHTML = username;
    if (images?.length > 0) {
        const userProfileUri = images[0];
        const imageNode = document.createElement("img");
        imageNode.setAttribute("src", userProfileUri);
        document.querySelector("#user-profile-container").removeChild(defaultImage);
        document.querySelector("#user-profile-container").addChild(imageNode);
    }
    profileBtn.addEventListener('click', onProfileButtonClicked);
}

const loadPlaylist = async (endpoint, elementId) => {
    const { playlists: { items } } = await fetchRequest(endpoint);
    for (let { name, description, images, id } of items) {
        const [{ url: image }] = images;
        const playlistItem = document.createElement("article");
        playlistItem.className = "flex flex-col justify-center px-2 py-1 rounded-lg hover:bg-light-black hover:cursor-pointer duration-200";
        playlistItem.id = id;
        playlistItem.setAttribute("data-type", "playlist");
        playlistItem.addEventListener("click", (event) => onPlaylistItemClicked(event, id));
        playlistItem.innerHTML = `
            <img class="object-contain mb-1 rounded" src="${image}" alt="Playlist">
            <header>
                <h2 class="font-semibold text-sm">${name}</h2>
                <p class="text-xs line-clamp-1 opacity-50">${description}</p>
            </header>
        `;
        document.querySelector(`#${elementId}`).appendChild(playlistItem);
    }
}

const loadPlaylists = () => {
    loadPlaylist(ENDPOINT.featuredPlaylist, "featured-playlists");
    loadPlaylist(ENDPOINT.toplists, "toplists-playlists");
}

const fillDashboardContent = () => {
    const pageContent = document.querySelector("#page-content");
    const playlistMap = new Map([["featured", "featured-playlists"], ["toplists", "toplists-playlists"]]);
    let innerHTMLString = ``;
    for (let [type, id] of playlistMap) {
        innerHTMLString += `
        <section id="${type}-container" class="p-4">
            <header>
                <h1 class="text-2xl font-bold capitalize">${type}</h1>
            </header>
            <div id="${id}" class="grid grid-cols-auto-fill-cards gap-4 px-2 mt-2">
            </div>
        </section>
        `;
    }
    pageContent.innerHTML = innerHTMLString;
}

const loadSection = (section) => {
    if (section.type == SECTIONTYPE.DASHBOARD) {
        fillDashboardContent();
        loadPlaylists();
    } else if (section.type == SECTIONTYPE.PLAYLIST) {
        fillPlaylistContent(section.playlist);
    }
    document.querySelector("#content").removeEventListener("scroll", onPageContentScroll);
    document.querySelector("#content").addEventListener("scroll", onPageContentScroll);
}

const onPageContentScroll = (event) => {
    const { scrollTop } = event.target;
    const header = document.querySelector("#content-nav");
    const playlistBanner = document.querySelector("#playlist-banner")

    if (scrollTop >= (header.offsetHeight / 2)) {
        header.classList.add("sticky", "top-0", "bg-black");
        header.classList.remove("bg-transparent");
    } else {
        header.classList.remove("sticky", "top-0", "bg-black");
        header.classList.add("bg-transparent");
    }
    if (history.state.type === SECTIONTYPE.PLAYLIST) {
        const playlistHeader = document.querySelector("#playlist-header");
        if (scrollTop >= (header.offsetHeight + playlistBanner.offsetHeight - (playlistHeader.offsetHeight))) {
            playlistHeader.classList.add("sticky", "px-2", "opacity-80", "bg-gray-800");
            playlistHeader.classList.remove("opacity-50", "mx-2");
            playlistHeader.style.top = `${header.offsetHeight}px`;
        } else {
            playlistHeader.classList.remove("sticky", "px-2", "opacity-80", "bg-gray-800");
            playlistHeader.classList.add("opacity-50", "mx-2");
            playlistHeader.style.top = `revert`;
        }
    }
}

const fillPlaylistContent = async (playlistId) => {
    const playlist = await fetchRequest(`${ENDPOINT.playlist}/${playlistId}`);
    const pageContent = document.querySelector("#page-content");
    pageContent.innerHTML = `
    <section id="playlist-container" class="w-full">
        <div id="playlist-banner" class="grid px-1 place-content-center grid-cols-[1fr_1fr] md:grid-cols-[0.5fr_1.5fr] w-full h-[30vh] overflow-hidden">
            
        </div>
        <div class="playlist-controls grid grid-cols-[1fr_1fr] h-[5vh] place-items-center">
            <button id="play" class="group rounded-full p-2 bg-green text-black pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                    class="h-[2rem] w-[2rem] group-hover:h-[2.1rem] group-hover:w-[2.1rem] duration-200">
                    <path fill-rule="evenodd"
                        d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
                        clip-rule="evenodd" />
                </svg>
            </button>
            <button id="like-playlist" class="group rounded-full p-1 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                    stroke-width="1.5" stroke="currentColor"
                    class="h-[2rem] opacity-50 w-[2rem] group-hover:h-[2.1rem] group-hover:w-[2.1rem] group-hover:opacity-100 duration-200">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
            </button>
        </div>
        <header id="playlist-header" class="mx-2 z-10 py-4 border-b-[0.5px] opacity-50 border-white mt-[2rem] duration-200">
            <ul class="grid justify-items-start grid-cols-[50px_1fr_1fr_50px] font-semibold">
                <li class="justify-self-center">#</li>
                <li>Title</li>
                <li>Album</li>
                <li>🕧</li>
            </ul>
        </header>
        <div id="tracks-container" class="w-full h-full px-2">

        </div>
    </section>
    `;
    loadPlaylistBanner(playlist);
    loadPlaylistTracks(playlist, playlistId);

}

const loadPlaylistBanner = ({ name, type, description, images }) => {
    const imageObj = images[0];
    const banner = document.querySelector("#playlist-banner");
    let innerHTMLString = `
    <div class="poster-wrapper h-[25vh] w-full grid place-items-center">
        <img class="object-contain h-[25vh]" src="${imageObj.url}" alt="playlist-theme">
    </div>
    <div class="playlist-info flex flex-col gap-1 pl-2 justify-center items-start">
        <p class="content-type font-semibold capitalize">${type}</p>
        <header>
            <h1 id="playlist-title" class="text-2xl md:text-4xl font-bold capitalize">${name}</h1>
        </header>
        <div class="desc mt-4">
            <p id="playlist-desc">${description}</p>
        </div>
    </div>
    `;

    banner.innerHTML = innerHTMLString;
}

const loadPlaylistTracks = ({ tracks }, playlistId) => {
    const trackContainer = document.querySelector("#tracks-container");
    let counter = 1;
    const loadedTracks = [];
    for (let trackItem of tracks.items.filter(item => item.track.preview_url)) {
        const { id, artists, name, album, duration_ms: duration, preview_url: previewUrl } = trackItem.track;
        const trackNode = document.createElement("article");
        trackNode.id = id;
        trackNode.className = "track group py-2 rounded-md my-2 w-full items-center grid grid-cols-[50px_1fr_1fr_50px] hover:bg-gray-600 hover:cursor-pointer";
        const image = album.images.find(img => img.height === 64);
        const trackArtists = Array.from(artists, artist => artist.name).join(", ");
        trackNode.innerHTML = `
        <p class="text-xs relative flex justify-center items-center"><span id="track-number" class="group-hover:invisible">${counter++}</span></p>
        <div class="track-info w-full h-full flex gap-1 items-start justify-items-start">
            <div class="track-img-wrapper h-full">
                <img class="h-[50px] w-[50px]" src="${image.url}" alt="${name}">
            </div>
            <div class="track-details">
                <h2 id="track-name" class="text-sm opacity-70 line-clamp-1 font-bold">${name}</h2>
                <p class="text-xs opacity-60 line-clamp-1">${trackArtists}</p>
            </div>
        </div>
        <p class="text-sm">${album.name}</p>
        <p class="opacity-60 text-sm">${formatDuration(duration)}</p>
        `;
        loadedTracks.push({ id, trackArtists, name, album, duration, previewUrl, image });

        trackNode.addEventListener("click", () => onTrackSelection(id));
        const playButtonForTrackNode = document.createElement("button");
        playButtonForTrackNode.id = `play-track-${id}`;
        playButtonForTrackNode.className = `play absolute left-0 w-full invisible group-hover:visible`;
        playButtonForTrackNode.innerHTML = `<span class="material-symbols-outlined">play_arrow</span>`;
        playButtonForTrackNode.setAttribute("data-track", "paused");
        playButtonForTrackNode.addEventListener("click", (event) => playTrack(event, loadedTracks, { image, trackArtists, name, previewUrl, id }));
        trackNode.querySelector("p").appendChild(playButtonForTrackNode);
        trackContainer.appendChild(trackNode);

    }
}

const onAudioReady = () => {
    const trackDuration = document.querySelector("#track-duration");
    trackDuration.innerHTML = `0:${audio.duration.toFixed(0)}`;
}

const setTrackPlayMode = (id) => {
    playBtn.querySelector("span").innerHTML = `<span style="font-size: larger;" class="material-symbols-outlined">pause_circle</span>`;
    const playButtonFromTracks = document.querySelector(`#play-track-${id}`);
    if (playButtonFromTracks) {
        playButtonFromTracks.innerHTML = `<span class="material-symbols-outlined">pause</span>`;
    }
}

const setTrackPauseMode = (id) => {
    playBtn.querySelector("span").innerHTML = `<span style="font-size: larger;" class="material-symbols-outlined">play_circle</span>`;
    const playButtonFromTracks = document.querySelector(`#play-track-${id}`);
    if (playButtonFromTracks) {
        playButtonFromTracks.innerHTML = `<span class="material-symbols-outlined">play_arrow</span>`;
    }
}

const playTrackHighlight = (id) => {
    document.querySelectorAll("#tracks-container .track").forEach(trackItem => {
        if (trackItem.id === id) {
            trackItem.classList.add("bg-gray-600");
            trackItem.querySelector("p span").classList.add("invisible");
            trackItem.querySelector("p .play").classList.remove("invisible");
            trackItem.querySelector("#track-name").classList.remove("opacity-70");
            trackItem.querySelector("#track-name").classList.add("text-light-green");
        } else {
            trackItem.classList.remove("bg-gray-600", "selected");
            trackItem.querySelector("p .play").classList.add("invisible");
            trackItem.querySelector("p span").classList.remove("invisible");
            trackItem.querySelector("#track-name").classList.add("opacity-70");
            trackItem.querySelector("#track-name").classList.remove("text-light-green");
        }
    })
}

const configTrackPlayMode = (currentTrackIndex, fetechedTracks, { id, image, name, trackArtists, previewUrl }) => {
    if (currentTrackIndex) {
        let index = 0;
        for (let track of fetechedTracks) {
            const trackItem = document.querySelector(`#play-track-${id}`);
            const status = trackItem?.querySelector("p span");
            if (index === currentTrackIndex) {
                const { id, image, name, trackArtists, previewUrl } = track;
                if (audio.src === previewUrl) {
                    if (audio.paused) {
                        audio.play();
                    } else {
                        audio.pause();
                    }
                } else {
                    audio.src = previewUrl;
                    if (status) {
                        status.setAttribute("data-track", "playing");
                        playTrackHighlight(id);
                    }
                    setNowPlayingTrackInfo({ image, id, name, trackArtists });
                    trackIndex = { currentTrackIndex, fetechedTracks };
                    audio.play();
                }
            } else {
                if (status) {
                    status.setAttribute("data-track", "paused");
                }
            }
            index++;
        }
    } else {

        const selectedTrackButton = document.querySelector(`#play-track-${id}`);
        for (let track of fetechedTracks) {
            if (track.id === id) {
                if (audio.src === previewUrl) {
                    if (selectedTrackButton) {
                        const status = selectedTrackButton.getAttribute("data-track");
                        if (status === "playing") {
                            selectedTrackButton.setAttribute("data-track", "pause");
                            audio.pause();
                        } else {
                            selectedTrackButton.setAttribute("data-track", "playing");
                            audio.play();
                        }
                    } else {
                        if (audio.paused) {
                            audio.play();
                        } else {
                            audio.pause();
                        }
                    }
                } else {
                    audio.src = previewUrl;
                    const currentTrackIndex = fetechedTracks?.findIndex(track => track.id === id);
                    trackIndex = { currentTrackIndex, fetechedTracks };
                    setNowPlayingTrackInfo({ image, id, name, trackArtists });
                    if (selectedTrackButton) {
                        selectedTrackButton.setAttribute("data-track", "playing");
                        playTrackHighlight(id);
                    }
                    audio.play();
                }
            }
        }
    }
}

const playTrack = (event, loadedTracks, { image, trackArtists, name, previewUrl, id }) => {
    const trackInfo = document.querySelector("#track-info-display");
    trackInfo.classList.remove("opacity-0");
    trackInfoObject = { id, image, name, trackArtists, previewUrl };
    // heremakechanges
    setItemInLocalStorage("TRACK_INFO", trackInfoObject);
    const fetchLocalStorageTracks = getItemInLocalStorage(LOADED_TRACKS);
    if (fetchLocalStorageTracks) {
        if (fetchLocalStorageTracks[0].id === loadedTracks[0].id) {
            configTrackPlayMode(null, fetchLocalStorageTracks, trackInfoObject);
        } else {
            localStorage.removeItem(LOADED_TRACKS);
            localStorage.setItem(LOADED_TRACKS, JSON.stringify(loadedTracks));
            const fetechedTracks = getItemInLocalStorage(LOADED_TRACKS);
            configTrackPlayMode(null, fetechedTracks, trackInfoObject);

        }
    } else {
        localStorage.setItem(LOADED_TRACKS, JSON.stringify(loadedTracks));
        const fetechedTracks = getItemInLocalStorage(LOADED_TRACKS);
        configTrackPlayMode(null, fetechedTracks, trackInfoObject);
    }
}

const setNowPlayingTrackInfo = ({ image, id, name, trackArtists }) => {
    const trackImg = document.querySelector("#playing-track-image");
    const trackName = document.querySelector("#playing-track-name");
    const artists = document.querySelector("#playing-track-artists");
    const audioControl = document.querySelector("#audio-control");

    audioControl.setAttribute("data-track-id", id);
    trackName.innerHTML = name;
    trackImg.setAttribute("src", image.url);
    artists.innerHTML = trackArtists;
}

const onTrackSelection = (id) => {
    document.querySelectorAll("#tracks-container .track").forEach(trackItem => {
        if (trackItem.id === id) {
            trackItem.classList.add("bg-gray-600");
            trackItem.querySelector("p span").classList.add("invisible");
            trackItem.querySelector("p .play").classList.remove("invisible");
        } else {
            trackItem.classList.remove("bg-gray-600", "selected");
            trackItem.querySelector("p .play").classList.add("invisible");
            trackItem.querySelector("p span").classList.remove("invisible");
        }
    })
}

const playCurrentTrack = () => {
    const { currentTrackIndex = -1, fetechedTracks = null } = trackIndex;
    if (currentTrackIndex > -1 && currentTrackIndex < fetechedTracks.length - 1) {
        configTrackPlayMode(currentTrackIndex, fetechedTracks, trackInfoObject);
    }
}

const playNextTrack = () => {
    const { currentTrackIndex = -1, fetechedTracks = null } = trackIndex;
    if (currentTrackIndex > -1 && currentTrackIndex < fetechedTracks.length - 1) {
        configTrackPlayMode(currentTrackIndex + 1, fetechedTracks, trackInfoObject);
    }
}

const playPreviousTrack = () => {
    const { currentTrackIndex = -1, fetechedTracks = null } = trackIndex;
    if (currentTrackIndex > 0) {
        configTrackPlayMode(currentTrackIndex - 1, fetechedTracks, trackInfoObject);
    }
}

const selectSidebarItem = (section) => {
    const selection = section.type;
    const dashboardButton = document.querySelector("#dashboard-btn");
    const searchButton = document.querySelector("#search-btn");
    const libraryButton = document.querySelector("#library-btn");
    if (selection === "DASHBOARD") {
        dashboardButton.setAttribute("href", `${CURRENT_URL}/dashboard/dashboard.html`);
        select(dashboardButton);
    } else if (selection === "SEARCH") {
        dashboardButton.setAttribute("href", `${CURRENT_URL}/search`);
        select(searchButton);
    } else {
        dashboardButton.setAttribute("href", `${CURRENT_URL}/library`);
        select(libraryButton);
    }
}

const select = (element) => {
    element.classList.add("bg-gray-600");
}

document.addEventListener("DOMContentLoaded", () => {
    const next = document.querySelector("#next-audio");
    const prev = document.querySelector("#prev-audio");
    const volume = document.querySelector("#volume");
    const timeline = document.querySelector("#timeline");
    const trackProgress = document.querySelector("#progress");
    const completedTrackDuration = document.querySelector("#track-duration-completed");
    const audioControl = document.querySelector("#audio-control");

    let progressInterval;
    loadUserProfile();
    const section = { type: SECTIONTYPE.DASHBOARD };
    selectSidebarItem(section);
    history.pushState(section, "", "");

    loadSection(section);
    document.addEventListener('click', () => {
        const profileMenu = document.querySelector("#profile-menu");
        if (!profileMenu.classList.contains("hidden")) {
            profileMenu.classList.add("hidden");
        }

    })

    volume.addEventListener("change", () => {
        audio.volume = volume.value / 100;
    })

    timeline.addEventListener("click", (event) => {
        const timelineWidth = window.getComputedStyle(timeline).width;
        const timeToSeek = (event.offsetX / parseInt(timelineWidth)) * audio.duration;
        audio.currentTime = timeToSeek;
        trackProgress.style.width = `${(audio.currentTime / audio.duration) * 100}%`
    }, false)

    audio.addEventListener("loadedmetadata", () => onAudioReady());

    audio.addEventListener("play", () => {
        const activeTrackId = audioControl.getAttribute("data-track-id");
        setTrackPlayMode(activeTrackId);

        progressInterval = setInterval(() => {
            if (audio.paused) {
                return
            }
            completedTrackDuration.textContent = `0:${audio.currentTime.toFixed(0)}`;
            trackProgress.style.width = `${(audio.currentTime / audio.duration) * 100}%`
        }, 100);
    })

    audio.addEventListener("pause", () => {
        const activeTrackId = audioControl.getAttribute("data-track-id");
        if (progressInterval) {
            clearInterval(progressInterval);
        }
        setTrackPauseMode(activeTrackId);
    })
    playBtn.addEventListener("click", () => {
        const activetrackId = audioControl.getAttribute("data-track-id");
        const selectedTrackButton = document.querySelector(`#play-track-${activetrackId}`);
        //currently playing track

        playCurrentTrack();
    })
    try {
        next.addEventListener("click", playNextTrack);
        prev.addEventListener("click", playPreviousTrack);
    } catch (err) {
        console.log(err);
    }

    window.addEventListener("popstate", (event) => {
        loadSection(event.state);
    });
})