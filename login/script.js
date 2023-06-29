window.onload = async function() {
    document.getElementById("login").addEventListener("click", goDiscord)
}

async function goDiscord(e) {
    const logo = document.getElementById("logo")
    logo.classList.add("start")
    await sleep(3000)
    window.location='./discord'
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}