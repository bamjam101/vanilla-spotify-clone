import { fetchRequest } from "../api";
import { ENDPOINT, logout, SECTIONTYPE } from "../common";

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
}

const fillPlaylistContent = async (playlistId) => {
    const playlist = await fetchRequest(`${ENDPOINT.playlist}/${playlistId}`);
    console.log(await playlist);
    const { description, followers, images, name, tracks } = playlist;
    const following = followers.total;
    const playlistImage = images[0].url;
    for (let track of tracks) {

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
    document.querySelector("#content").addEventListener("scroll", (event) => {
        const { scrollTop } = event.target;
        const header = document.querySelector("#content-nav");
        if (scrollTop >= header.offsetHeight) {
            header.classList.add("sticky", "top-0", "bg-black");
            header.classList.remove("bg-transparent");
        } else {
            header.classList.remove("sticky", "top-0", "bg-black");
            header.classList.add("bg-transparent");
        }
    })
    window.addEventListener("popstate", (event) => {
        loadSection(event.state);
    })
})