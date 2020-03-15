import './carousel.scss';

/** options type definition */
export class Options {
    container;
    title;
    subtitle;
    fetchCards;
}

/** card type definition */
export class Card {
    image;
    type;
    duration;
    durationLabel;
    title;
    cardinality;
    language;
}

export class Carousel {
    /** carousel container */
    containerEl;
    /** the container for the cards and scroll */
    cardContainerEl;
    /** overlay arrow to go prev */
    leftArrowEl;
    /** overlay arrow to go next */
    rightArrowEl;
    /** callback to execute on new card demand */
    fetchCards;
    /** chunk size of cards being loaded */
    chunkSize = 6;
    /** how many cards to slide each time */
    numberOfCardsToSlide = 1;
    /** index of the most left visible card */
    mostLeftVisibleIndex = 0;
    /** index of the most right visible card */
    mostRightVisibleIndex = 0;
    /** keep track of number of cards */
    numberOfCards = 0;

    /** css class dictionary */
    css = {
        // carousel
        container: 'carousel-container',
        // header section
        header: "header",
        iconContainer: "icon-container",
        icon: "icon",
        iconName: "face",
        titleContainer: "title-container",
        title: "title",
        arrow: "arrow",
        subtitle: "subtitle",
        body: "body",
        carousel: "carousel",
        leftArrow: "slider top left",
        rightArrow: "slider top right",
        // card section
        cardContainer: "card-container",
        placeholder: "placeholder",
        card: "card",
        imageContainer: "image-container",
        image: "image",
        type: "transparent-label bottom left",
        duration: "transparent-label bottom right",
        descriptionContainer: "description-container",
        description: "description",
        language: "language",
        content: "content",
        skeletonRow: "ske-row",
        skeletonLine: "ske-line",
        bottomBars: "bottom-bars",
        bar1: "bar1",
        bar2: "bar2",
        seeMore: "see-more",
        // extras
        d_none: "d-none",
        d_block: "d-block",
        iconClassName: "material-icons",
        titleArrowIcon: "keyboard_arrow_right",
        rightSliderIcon: "keyboard_arrow_right",
        leftSliderIcon: "keyboard_arrow_left"
    }

    /**
     * @param {Options} options 
     */
    constructor(options) {
        // init the card and placeholder lists
        this.cards = [];
        this.placeholders = [];
        // bind the fetch cards event
        this.fetchCards = options.fetchCards;
        // initialize the container
        this.containerEl = document.getElementById(options.container);
        this.containerEl.className = this.css.container;
        // add the header & body tempates to the container
        this.containerEl.appendChild(this.createCarouselHeaderElement({ title: options.title, subtitle: options.subtitle }));
        this.containerEl.appendChild(this.createCarouselBodyElement());
        this.cardContainerEl = this.containerEl.getElementsByClassName(this.css.cardContainer)[0];
        // scrolling overlays
        this.leftArrowEl = this.containerEl.getElementsByClassName(this.css.leftArrow)[0];
        this.rightArrowEl = this.containerEl.getElementsByClassName(this.css.rightArrow)[0];
        // bind scrolling events
        this.rightArrowEl.addEventListener('click', () => this.next());
        this.leftArrowEl.addEventListener('click', () => this.prev());
        // bind the mouse in and out events for slider state
        this.initHoverEvent();
        // first card load into the carousel
        this.loadNewCards().then(numberOfItems => {
            // we find out the number of cards to slide after the first load
            this.numberOfCardsToSlide = this.getNumberOfVisibleCards();
            // it also points out the most right visible card
            this.mostRightVisibleIndex = this.numberOfCardsToSlide - 1;
            // if the number of cards are in chunk size
            // it means that there would be more cards
            if (numberOfItems === this.chunkSize)
                this.addSeeMoreCard();
        });
    }

    /**
     * @returns {number} of cards that can fit in carousel scroll
     */
    getNumberOfVisibleCards() {
        if (!this.cardContainerEl)
            throw Error("The card container has not been instanced.");
        // get the cards from the container
        let cards = this.getCardElements();
        // if there is any cards
        if (cards && cards.length)
            return Math.round(this.cardContainerEl.clientWidth / cards[0].clientWidth);
        // if there is no card, then no need to slide anyway
        return 0;
    }

    /**
     * initialize visibility states check through the events
     */
    initHoverEvent() {
        if (!this.containerEl)
            throw Error("The container has not been instanced.");
        if (!this.leftArrowEl)
            throw Error("The left arrow has not been instanced.");
        if (!this.rightArrowEl)
            throw Error("The right arrow has not been intanced.");
        if (!this.cardContainerEl)
            throw Error("The card container has not been instanced.");
        // clear the element class list for display
        let clearDisplayCSS = (element) => element.classList.remove(this.css.d_none, this.css.d_block);
        // when the mouse is over the root container
        this.containerEl.addEventListener('mouseover', () => {
            // if the carousel scroll is on the most left, invisible; else visible
            let arrowLeftClass = this.cardContainerEl.scrollLeft === 0 ?
                this.css.d_none : this.css.d_block;
            // if there are no more cards after the most right visible card, invisible; else visible
            let arrowRightClass = (this.mostRightVisibleIndex + 1) >= this.numberOfCards ?
                this.css.d_none : this.css.d_block;
            // clear the classes
            clearDisplayCSS(this.leftArrowEl);
            clearDisplayCSS(this.rightArrowEl);
            // set them fresh
            this.leftArrowEl.classList.add(arrowLeftClass);
            this.rightArrowEl.classList.add(arrowRightClass);
        });
        // when the mouse leaves the root container
        this.containerEl.addEventListener('mouseout', () => {
            clearDisplayCSS(this.leftArrowEl);
            clearDisplayCSS(this.rightArrowEl);
        });
    }

    /**
     * @param {string} html template
     * @return {HTMLElement}
     */
    htmlToElement(html) {
        // create a fake container element
        let container = document.createElement('template');
        container.innerHTML = html.trim();
        return container.content.firstChild;
    }

    /**
     * @param {string} title
     * @param {string} subtitle
     * @returns {HTMLElement} carousel header element
     */
    createCarouselHeaderElement({ title, subtitle }) {
        return this.htmlToElement(`
            <div class="${this.css.header}">
                <div class="${this.css.iconContainer}">
                    <i class="${this.css.iconClassName} ${this.css.icon}">${this.css.iconName}</i>
                </div>
                <div class="${this.css.titleContainer}">
                    <div class="${this.css.title}">
                        <div>${title || ""}</div>
                        <i class="${this.css.iconClassName} ${this.css.arrow}">${this.css.titleArrowIcon}</i>
                    </div>
                    <div class="${this.css.subtitle}">
                        ${subtitle || ""}
                    </div>
                </div>
            </div>`);
    }

    /**
     * @returns {HTMLElement} carousel body element
     */
    createCarouselBodyElement() {
        return this.htmlToElement(`
            <div class="${this.css.body}">
                <div class="${this.css.carousel}">
                    <div class="${this.css.cardContainer}">

                    </div>
                    <div class="${this.css.leftArrow}">
                        <i class="${this.css.iconClassName} ${this.css.arrow}">${this.css.leftSliderIcon}</i>
                    </div>
                    <div class="${this.css.rightArrow}">
                        <i class="${this.css.iconClassName} ${this.css.arrow}">${this.css.rightSliderIcon}</i>
                    </div>
                </div>
            </div>`);
    }

    /**
     * @param {Card} card 
     * @returns {HTMLElement} card element
     */
    createCardElement(card) {
        return this.htmlToElement(`
            <div class="${this.css.card} ${card.cardinality}">
                <div class="${this.css.imageContainer}">
                    <img class="${this.css.image}" src="${card.image}">
                    <div class="${this.css.type}">
                        ${card.type || ""}
                    </div>
                    <div class="${this.css.duration}">
                        ${card.durationLabel || ""}
                    </div>
                </div>
                <div class="${this.css.descriptionContainer}">
                    <div class="${this.css.content}">
                        <div class="${this.css.description}">
                            ${card.title || ""}
                        </div>
                        <div class="${this.css.language}">
                            ${card.language || ""}
                        </div>
                    </div>
                </div>
                <div class="${this.css.bottomBars}">
                    <div class="${this.css.bar1}"></div>
                    <div class="${this.css.bar2}"></div>
                </div>
            </div>`);
    }

    /**
     * @returns {HTMLElement} card placeholder element
     */
    createPlaceholderCardElement() {
        return this.htmlToElement(`
            <div class="${this.css.card} ${this.css.placeholder}">
                <div class="${this.css.imageContainer}">
                    <div class="${this.css.image}">
                    </div>
                </div>
                <div class="${this.css.descriptionContainer}">
                    <div class="${this.css.content}">
                        <div style="height: 50%">
                            <div class="${this.css.skeletonRow}">
                                <div class="${this.css.skeletonLine}" style="width: 100%;"></div>    
                            </div>
                            <div class="${this.css.skeletonRow}" style="padding-top:.5em">
                                <div class="${this.css.skeletonLine}" style="width: 80%;"></div>    
                            </div>
                        </div>
                        <div style="height: 50%">
                            <div class="${this.css.skeletonRow}">
                                <div class="${this.css.skeletonLine}" style="width: 40%;"></div>    
                                <div class="${this.css.skeletonLine}" style="width: 40%;"></div>
                            </div>
                            <div class="${this.css.skeletonRow}" style="padding-top:.5em">
                                <div class="${this.css.skeletonLine}" style="width: 40%;"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`);
    }

    /**
     * @returns {HTMLElement} card-like see more button
     */
    createSeeMoreCardElement() {
        return this.htmlToElement(`
            <div class="${this.css.card} ${this.css.seeMore}">
                <div class="${this.css.content}">
                    More Like This 
                    <i class="${this.css.iconClassName} ${this.css.arrow}">${this.css.titleArrowIcon}</i>
                    <i class="${this.css.iconClassName} ${this.css.arrow}">${this.css.titleArrowIcon}</i>
                </div>
            </div>`);
    }

    /**
     * @param {number} seconds 
     * @returns {string} duration in strings
     */
    secondsToDurationLabel(seconds) {
        let date = new Date(0);
        date.setSeconds(seconds);
        return date.toISOString().substr(11, 5);
    }

    /** 
     * loads new cards from the API 
     * @returns {number} number of items returned by the API
     */
    loadNewCards() {
        return new Promise((resolve, reject) => {
            if (!this.fetchCards) {
                resolve(0);
                return;
            }
            // temporary placeholders
            this.addPlaceholders();
            // request the items from the API
            this.fetchCards(this.chunkSize).then(
                items => {
                    // clean the skeleton boxes 
                    this.removePlaceholders();
                    // if no item comes from the API
                    if (!items) return;
                    // and place the cards
                    items.forEach(card => {
                        // convert to the human readable duration
                        card.durationLabel = this.secondsToDurationLabel(card.duration);
                        // create HTML card element and add it
                        this.addCard(this.createCardElement(card))
                    });

                    resolve(items.length);
                },
                // the request failed!
                reason => reject(reason));
        });
    }

    /**
     * @returns {HTMLElement[]} card elements in the carousel
     */
    getCardElements() {
        if (!this.cardContainerEl)
            throw Error("The card container has not been instanced.");
        // return the cards by the 'card' class identifier
        return this.cardContainerEl.getElementsByClassName(this.css.card);
    }

    /**
     * adds the given card element in the card container
     * it could be any type of card: placeholder, see-more, singular, collection cards
     * @param {HTMLElement} element card element 
     */
    addCard(element) {
        if (!this.cardContainerEl)
            throw Error("The card container has not been instanced.");
        // add in the carousel
        this.cardContainerEl.appendChild(element);
        // keep track of the total number of cards
        this.numberOfCards++;
    }

    /**
     * remove the given card element from the carousel
     * @param {HTMLElement} element card element
     */
    removeCard(element) {
        if (!this.cardContainerEl)
            throw Error("The card container has not been instanced.");
        // remove from the carousel
        this.cardContainerEl.removeChild(element);
        // keep track of the total number of cards
        this.numberOfCards--;
    }

    /** adds temporary placeholder cards in the carousel while waiting for loading  */
    addPlaceholders() {
        // create placeholders in the chunksize as it is expected
        for (let i = 0; i < this.chunkSize; i++)
            // create the element and add in the carousel
            this.addCard(this.createPlaceholderCardElement());
    }

    /** remove temporary placeholders */
    removePlaceholders() {
        if (!this.cardContainerEl)
            throw Error("The card container has not been instanced.");
        // find out placeholder card elements
        let placeholders = this.cardContainerEl.getElementsByClassName(this.css.placeholder);
        // remove the elements till the collection ends
        while (placeholders.length)
            this.removeCard(placeholders[0]);
    }

    /** adds see-more card in the carousel */
    addSeeMoreCard() {
        // create the card element
        let seeMoreCard = this.createSeeMoreCardElement();
        // implement the on click event
        seeMoreCard.addEventListener('click', () => {
            // remove the current card
            this.removeCard(seeMoreCard);
            // then try to load new cards from the API
            this.loadNewCards().then(numberOfItems => {
                // if there are cards from the API, then slide on them
                if (numberOfItems) this.next();
                // if the number of cards are in chunk size
                // it means that there would be more cards
                if (numberOfItems === this.chunkSize)
                    this.addSeeMoreCard();
            });
        });
        // add the card in the carousel
        this.addCard(seeMoreCard);
    }

    /**
     * move the most left and right indexes to have a consistent track
     * @param {number} diff index to increment, could be below 0
     */
    shiftIndexes(diff) {
        this.mostLeftVisibleIndex += diff;
        this.mostRightVisibleIndex += diff;
    }

    /** slides the carousel backward */
    prev() {
        let cards = this.getCardElements();
        // if there is no card to slide
        if (!cards || cards.length === 0) return;
        let to = this.mostLeftVisibleIndex - this.numberOfCardsToSlide;
        // if it cross the line
        if (to < 0) to = 0;
        // here we slide!
        cards[to].scrollIntoView({ behavior: 'smooth' });
        // remember the indices
        this.shiftIndexes(to - this.mostLeftVisibleIndex);
    }

    /** slides the carousel forward */
    next() {
        let cards = this.getCardElements();
        // if there is no card to slide
        if (!cards || cards.length === 0) return;
        let to = this.mostRightVisibleIndex + this.numberOfCardsToSlide;
        // if it cross the line
        if (to >= cards.length) to = cards.length - 1;
        // here we slide!
        cards[to].scrollIntoView({ behavior: 'smooth' });
        // remember the indices
        this.shiftIndexes(to - this.mostRightVisibleIndex);
    }
}