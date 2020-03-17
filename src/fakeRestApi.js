
/** fake the rest api and return random cards */
export class FakeRestApi {
    /** get a random element from an array */
    getRandomElement = (array) =>
        array ? array[Math.round(Math.random() * (array.length - 1))] : null;

    // Options
    titleOptions = [
        "Welcome to Effective Time Management",
        "Choosing The Best Audio Player Software For Your Computer",
        "The Small Change That Creates Massive Results In Your Life",
        "Advance Your Brand Potential With Giant Advertising Blimps",
        "How To Write Better Advertising Copy"
    ];

    typeOptions = ["VIDEO", "ELEARNING", "ELEARNING PLAN", "PLAYLIST"];

    cardinalityOptions = ["collection", "single"];

    languageOptions = ["English", "German", "Italian", "Turkish"];

    /**
     * fake request to the REST API
     * @param {number} chunkSize max number of cards, returned for each request
     * @param {number} maxDelayMs max milliseconds delay for each request
     * @param {number} minSize min number of cards, returned for each request
     * @returns {Promise} an array of cards
     */
    request = function (chunkSize = 6, minSize = 1, maxDelayMs = 2000) {
        if (chunkSize < minSize)
            throw Error('What are you trying to do? The min size cannot be bigger than the chunk size');
        // item collection to return
        let items = [];
        // if the max delay is not defined, then no delay
        let delayMs = maxDelayMs ? Math.round(Math.random() * maxDelayMs) : 0;
        // by 50 percent chance, it returns with full chunk size
        let randomChunkSize = Math.random() > 0.5 ? Math.random() * (chunkSize - minSize) + minSize : chunkSize;
        for (let i = 0; i < randomChunkSize; i++) {
            // id range from 1000 - 1025
            let imageId = Math.round(Math.random() * 25 + 1000);
            let title = this.getRandomElement(this.titleOptions);
            let type = this.getRandomElement(this.typeOptions);
            let cardinality = this.getRandomElement(this.cardinalityOptions);
            let language = this.getRandomElement(this.languageOptions);
            // seconds range 60 - 3600 * 5
            let duration = Math.round(Math.random() * (60 * 60 * 5 - 60) + 60);

            items.push({
                image: `https://picsum.photos/id/${imageId}/800/400`,
                title: title,
                type: type,
                cardinality: cardinality,
                language: language,
                duration: duration
            });
        }

        return new Promise((resolve, _reject) =>
            setTimeout(() => resolve(items), delayMs));
    }
}