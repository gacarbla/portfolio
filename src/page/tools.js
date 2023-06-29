async function require(url, canonical) {
    return new Promise(async resolve => {
        var response = await fetch(`${canonical ? `${window.location.href.split("/")[0]}/${url}` : `${url}`}`);
        if (window.location.href.startsWith("http://127.0.0.1:5501/")) response = await fetch(`${canonical ? `http://127.0.0.1:5501/${url}` : `${url}`}`);
        const json = await response.json();
        resolve(json)
    })
}