const text = (process.argv[2] || "").split(';');

const parsed = {
    "word": text[0] || "",
    "translations": {
        "pl": text[1] || "",
        "en": text[2] || "",
    }
};

console.log(JSON.stringify(parsed));
