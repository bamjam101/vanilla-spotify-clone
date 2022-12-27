// Key names for values stored in local storage.
export const ACCESS_TOKEN = "ACCESS_TOKEN";
export const TOKEN_TYPE = "TOKEN_TYPE";
export const EXPIRES_IN = "EXPIRES_IN";
export const LOADED_TRACKS = "LOADED_TRACKS";

//App url decides current url for the browser redirect or load.
const APP_URL = import.meta.env.VITE_APP_URL;

// Endpoints are meant for requesting data from spotify api.
export const ENDPOINT = {
    userInfo: "me",
    featuredPlaylist: "browse/featured-playlists?limit=5",
    toplists: "browse/categories/toplists/playlists?limit=10",
    playlist: "playlists"
}

// Logout functionality, removes stored credentials from local storage.
export const logout = () => {
    localStorage.removeItem(ACCESS_TOKEN)
    localStorage.removeItem(TOKEN_TYPE)
    localStorage.removeItem(EXPIRES_IN)
    window.location.href = APP_URL;
}

// getter and setter functions for local storage.
export const setItemInLocalStorage = (key, value) => localStorage.setItem(key, JSON.stringify(value));
export const getItemInLocalStorage = (key) => JSON.parse(localStorage.getItem(key));

// different sections of dashboard, toggled dynamically using loadSection function.
export const SECTIONTYPE = {
    DASHBOARD: "DASHBOARD",
    PLAYLIST: "PLAYLIST"
}