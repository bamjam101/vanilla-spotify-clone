import { fetchRequest } from "../api";
import { ENDPOINT, logout } from "../common";

const onProfileButtonClicked = (event) => {
    event.stopPropagation();
    const profileMenu = document.querySelector("#profile-menu");
    profileMenu.classList.toggle("hidden");
    if (!profileMenu.classList.contains("hidden")) {
        profileMenu.querySelector("li#logout-btn").addEventListener('click', logout);
    }
}

const onPlaylistItemClicked = (event) => {
    console.log(event.target);
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

const loadFeaturedPlaylist = async () => {
    const { playlists: { items } } = await fetchRequest(ENDPOINT.featuredPlaylist);
    for (let { name, description, images, id } of items) {
        const [{ url: image }] = images;
        const playlistItem = document.createElement("article");
        playlistItem.className = "flex flex-col gap-1 justify-center px-2 rounded-lg hover:bg-light-black hover:cursor-pointer duration-200";
        playlistItem.id = id;
        playlistItem.setAttribute("data-type", "playlist");
        playlistItem.addEventListener("click", onPlaylistItemClicked);
        playlistItem.innerHTML = `
            <img class="object-cover mb-2 rounded" src="${image}" alt="Playlist">
            <header>
                <h2 class="font-semibold text-sm">${name}</h2>
                <p class="text-xs truncate">${description}</p>
            </header>
        `;
        document.querySelector(".featured-songs").appendChild(playlistItem);
    }

}

document.addEventListener("DOMContentLoaded", () => {
    loadUserProfile();
    loadFeaturedPlaylist();
    document.addEventListener('click', () => {
        const profileMenu = document.querySelector("#profile-menu");
        if (!profileMenu.classList.contains("hidden")) {
            profileMenu.classList.add("hidden");
        }

    })
})