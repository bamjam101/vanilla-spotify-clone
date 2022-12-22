import { fetchRequest } from "../api";
import { ENDPOINT, logout, SECTIONTYPE } from "../common";

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
        playlistItem.className = "flex flex-col gap-1 justify-center px-2 rounded-lg hover:bg-light-black hover:cursor-pointer duration-200";
        playlistItem.id = id;
        playlistItem.setAttribute("data-type", "playlist");
        playlistItem.addEventListener("click", (event) => onPlaylistItemClicked(event, id));
        playlistItem.innerHTML = `
            <img class="object-cover mb-2 rounded" src="${image}" alt="Playlist">
            <header>
                <h2 class="font-semibold text-sm">${name}</h2>
                <p class="text-xs truncate line-clamp-2 opacity-50">${description}</p>
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
    if (scrollTop >= header.offsetHeight) {
        header.classList.add("sticky", "top-0", "bg-black");
        header.classList.remove("bg-transparent");
    } else {
        header.classList.remove("sticky", "top-0", "bg-black");
        header.classList.add("bg-transparent");
    }
    if (history.state.type === SECTIONTYPE.PLAYLIST) {
        const playlistHeader = document.querySelector("#playlist-header");
        if (scrollTop >= playlistHeader.offsetHeight) {
            playlistHeader.classList.add("sticky", `top-[${header.offsetHeight}px]`)
        }
    }
}

const fillPlaylistContent = async (playlistId) => {
    const playlist = await fetchRequest(`${ENDPOINT.playlist}/${playlistId}`);
    const pageContent = document.querySelector("#page-content");
    pageContent.innerHTML = `
    <section id="playlist-container" class="flex flex-col items-center h-full w-full">
        <div class="playlist-poster grid grid-cols-[0.5fr_1.5fr] w-full">
            <div class="poster-wrapper h-full grid place-items-center">
                <img class="object-contain h-full" src="--" alt="playlist-theme">
            </div>
            <div class="playlist-info flex flex-col gap-1 justify-center items-start">
                <p class="content-type font-semibold">Playlist</p>
                <header>
                    <h1 id="playlist-title" class="text-6xl font-bold capitalize">Playlist Name</h1>
                </header>
                <div class="desc mt-5">
                    <p id="playlist-desc">Description for playlist</p>
                </div>
            </div>
            <div class="playlist-controls grid grid-cols-[1fr_1fr] h-[5vh] place-items-center">
                <button id="play" class="group rounded-full p-2 bg-green text-black">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"
                        class="h-[2rem] w-[2rem] group-hover:h-[2.1rem] group-hover:w-[2.1rem] duration-200">
                        <path fill-rule="evenodd"
                            d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
                            clip-rule="evenodd" />
                    </svg>
                </button>
                <button id="like-playlist" class="group rounded-full p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                        stroke-width="1.5" stroke="currentColor"
                        class="h-[2rem] opacity-50 w-[2rem] group-hover:h-[2.1rem] group-hover:w-[2.1rem] group-hover:opacity-100 duration-200">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                </button>
            </div>
        </div>
        <header class="px-4 pb-2 w-full mt-[2rem]">
            <ul id="playlist-header" class="grid justify-items-start opacity-50 grid-cols-[50px_2fr_1fr_50px] font-semibold">
                <li class="justify-self-center">#</li>
                <li>Title</li>
                <li>Album</li>
                <li>🕧</li>
            </ul>
        </header>
        <div id="tracks-container" class="w-full h-full">

        </div>
    </section>
    `;

    loadPlaylistTracks(playlist);

}

const loadPlaylistTracks = ({ tracks }) => {
    const trackContainer = document.querySelector("#tracks-container");
    let counter = 1;
    for (let trackItem of tracks.items) {
        const { id, artists, name, album, duration_ms: duration } = trackItem.track;
        const trackNode = document.createElement("article");
        trackNode.id = id;
        trackNode.className = "px-4 py-2 rounded-md my-2 w-full grid grid-cols-[50px_2fr_1fr_50px] hover:bg-gray-600 hover:cursor-pointer";
        const image = album.images.find(img => img.height === 64);
        trackNode.innerHTML = `
        <p class="justify-self-center">${counter++}</p>
        <div class="track-info w-full h-full flex gap-1 items-start justify-items-start">
            <div class="track-img-wrapper h-full">
                <img class="h-[50px] w-[50px]" src="${image.url}" alt="${name}">
            </div>
            <div class="track-details">
                <h2 id="track-title" class="text-xl">${name}</h2>
                <p id="artists" class="text-sm opacity-60">${Array.from(artists, artist => artist.name).join(", ")}</p>
            </div>
        </div>
        <p>${album.name}</p>
        <p class="opacity-60">${formatDuration(duration)}</p>
        `;
        trackContainer.appendChild(trackNode);
    }

}

document.addEventListener("DOMContentLoaded", () => {
    loadUserProfile();
    const section = { type: SECTIONTYPE.DASHBOARD };
    history.pushState(section, "", "");
    loadSection(section);
    document.addEventListener('click', () => {
        const profileMenu = document.querySelector("#profile-menu");
        if (!profileMenu.classList.contains("hidden")) {
            profileMenu.classList.add("hidden");
        }

    })

    window.addEventListener("popstate", (event) => {
        loadSection(event.state);
    })
})