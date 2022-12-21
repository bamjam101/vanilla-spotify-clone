const onProfileButtonClicked = (event) => {
    event.stopPropagation();
}

const loadUserProfile = (event) => {
    const defaultImage = documnet.querySelector("#default-profile");
    const profileBtn = documnet.querySelector("#profile-btn");
    const displayUsername = document.querySelector("#username");
    profileBtn.addEventListener("click", onProfileButtonClicked);
}

document.addEventListener("DOMContentLoaded", () => {
    loadUserProfile();
})