/** options type definition */
export class Options {
    container = "";
    title = "";
    subtitle = "";
    fetchCards = Promise.resolve(null);
}

/** card type definition */
export class Card {
    image = "";
    type = "";
    duration = 0;
    durationLabel = "";
    title = "";
    cardinality = "";
    language = "";
}

export class Carousel {
    /** carousel container */
    containerEl = null;
    /** the container for the cards and scroll */
    cardContainerEl = null;
    /** overlay arrow to go prev */
    leftArrowEl = null;
    /** overlay arrow to go next */
    rightArrowEl = null;
    /** callback to execute on new card demand */
    fetchCards = Promise.resolve(null);
    /** chunk size of cards being loaded */
    chunkSize = 6;
    /** card width in pixel */
    cardWidth = 0;
    /** how many cards to slide each time */
    numberOfVisibleCards = 1;
    /** index of the most left visible card */
    mostLeftVisibleIndex = 0;
    /** index of the most right visible card */
    mostRightVisibleIndex = 0;
    /** keep track of number of cards */
    numberOfCards = 0;
    /** event emitter */
    onFirstBatchEventEmitter = document.createElement("object");

    /** css class dictionary */
    css = {
        // carousel
        container: 'carousel-container',
        // header section
        header: "header",
        iconContainer: "icon-container",
        icon: "icon",
        iconName: "view_carousel",
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

    /** @param {Options} options */
    constructor(options) {
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
        // make first card load into the carousel
        this.loadCards().then(cardElements => {
            // if there is no card returned by the API
            // nothing to do then
            if (!cardElements || !cardElements.length) return;
            // set the card width
            this.cardWidth = cardElements[0].clientWidth;
            // we find out the number of cards to slide after the first load
            this.numberOfVisibleCards = Math.round(this.cardContainerEl.clientWidth / this.cardWidth);
            // it also points out the most right visible card
            this.mostRightVisibleIndex = Math.min(this.numberOfVisibleCards, cardElements.length) - 1;
            // if the number of cards are in chunk size
            // it means that there would be more cards
            if (cardElements.length === this.chunkSize)
                this.addSeeMoreCard();
            // bind the mouse in and out events for slider state
            this.initHoverEvent();
            // bind the touch events for swiping
            this.initSwipeEvent();
            // emit the event first batch loaded
            this.emitFirstBatchLoadEvent(cardElements);
        });
    }

    /** 
     * listens first batch load event
     * @param {(event: CustomEvent) => {}} callback
     */
    onFirstBatchLoaded(callback) {
        // if no callback provided, no need to listen the event
        if (!callback) return;
        // listen the event first batch
        this.onFirstBatchEventEmitter
            .addEventListener('firstbatch', event => callback(event));
    }

    /**
     * emit the first batch loaded event
     * @param {HTMLElement[]} cards 
     */
    emitFirstBatchLoadEvent(cards) {
        this.onFirstBatchEventEmitter
            .dispatchEvent(new CustomEvent('firstbatch', { detail: { cards: cards } }));
    }

    /** bind events for swiping the carousel */
    initSwipeEvent() {
        if (!this.cardContainerEl)
            throw Error("The card container has not been instanced.");
        // x coordinate of the last touch
        let xLastTouch = null;
        // when the user starts touch event, init the touch point
        this.cardContainerEl.addEventListener('touchstart', (event) =>
            xLastTouch = event.touches[0].clientX);
        // when the user ends touch event, refresh the last touch point
        this.cardContainerEl.addEventListener('touchend', (_event) =>
            xLastTouch = null);
        // while swiping the carousel
        this.cardContainerEl.addEventListener('touchmove', (event) => {
            if (!xLastTouch) return;
            // get the current x coordinate
            let xCurr = event.touches[0].clientX;
            // get the difference between first and last touched points
            let xDiff = xLastTouch - xCurr;
            // find out the number of cards to swipe
            let numberOfCardsToSwipe = Math.round(Math.abs(xDiff) / this.cardWidth);
            // if any to swipe
            if (numberOfCardsToSwipe) {
                // compare the first and last points
                // left swipe
                if (xDiff > 0) this.next(numberOfCardsToSwipe);
                // right swipe
                else this.prev(numberOfCardsToSwipe);
                // remember the last position
                xLastTouch = xCurr;
            }
        });
    }

    /** bind events for left - right arrow visibility states */
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
     * @returns {HTMLElement[]} cards being added
     */
    loadCards() {
        return new Promise((resolve, reject) => {
            if (!this.fetchCards) {
                resolve([]);
                return;
            }
            let cards = [];
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
                        let cardElement = this.createCardElement(card);
                        this.addCard(cardElement);
                        // add in the promise collection
                        cards.push(cardElement);
                    });

                    resolve(cards);
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
            this.loadCards().then(numberOfItems => {
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
    moveIndexes(diff) {
        this.mostLeftVisibleIndex += diff;
        this.mostRightVisibleIndex += diff;
    }

    /** slides the carousel backward */
    prev(numberOfCardsToSlide = this.numberOfVisibleCards) {
        if (!numberOfCardsToSlide) return;
        let cards = this.getCardElements();
        // if there is no card to slide
        if (!cards || cards.length === 0) return;
        let to = this.mostLeftVisibleIndex - numberOfCardsToSlide;
        // if it cross the line
        if (to < 0) to = 0;
        // here we slide!
        this.slideTo(cards[to]);
        // remember the indices
        this.moveIndexes(to - this.mostLeftVisibleIndex);
    }

    /** slides the carousel forward */
    next(numberOfCardsToSlide = this.numberOfVisibleCards) {
        if (!numberOfCardsToSlide) return;
        let cards = this.getCardElements();
        // if there is no card to slide
        if (!cards || cards.length === 0) return;
        let to = this.mostRightVisibleIndex + numberOfCardsToSlide;
        // if it cross the line
        if (to >= cards.length) to = cards.length - 1;
        // here we slide!
        this.slideTo(cards[to]);
        // remember the indices
        this.moveIndexes(to - this.mostRightVisibleIndex);
    }

    /**
     * slides to the given element
     * @param {HTMLElement} element to slide
     */
    slideTo(element) {
        element.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
    }
}