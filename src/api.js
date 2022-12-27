import { ACCESS_TOKEN, EXPIRES_IN, logout, TOKEN_TYPE } from "./common";

// base url for spotify authorization.
const BASE_API_URL = import.meta.env.VITE_API_BASE_URL;

// check for if credential have expired to remove temporary access.
const getAccessToken = () => {
    const accessToken = localStorage.getItem(ACCESS_TOKEN);
    const tokenType = localStorage.getItem(TOKEN_TYPE);
    const expiresIn = localStorage.getItem(EXPIRES_IN);
    if (Date.now() < expiresIn) {
        return { accessToken, tokenType };
    } else {
        logout();
    }
}

// header configuration for requesting spotify api.
const createAPIConfig = ({ accessToken, tokenType }, method = "GET") => {
    return {
        headers: {
            Authorization: `${tokenType} ${accessToken}`
        }, method
    }
}

// fetcher function for spotify api.
export const fetchRequest = async (endpoint) => {
    const url = `${BASE_API_URL}/${endpoint}`;
    const res = await fetch(url, createAPIConfig(getAccessToken()));
    return res.json();
}