/**
 * @param {string} html representing a single element
 * @return {HTMLElement}
 */
function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}

/**
 * Options type definition
 */
class Options {
    container;
    title;
    subtitle;
    fetchCards;
}

/**
 * Card type definition
 */
class Card {
    image;
    type;
    duration;
    title;
    cardinality;
}

/**
 * Css class dictionary
 */
const cssClass = {
    container: 'carousel-container',
    header: "header",
    iconContainer: "icon-container",
    icon: "icon",
    titleContainer: "title-container",
    title: "title",
    arrow: "arrow",
    subtitle: "subtitle",
    body: "body",
    carousel: "carousel",
    cardContainer: "card-container",
    leftArrow: "slider top left",
    rightArrow: "slider top right",
}

class Carousel {
    containerEl;
    cardContainerEl;
    leftArrowEl;
    rightArrowEl;

    sliderIntervalId;
    cards;

    /**
     * @param {Options} options 
     */
    constructor(options) {
        let template = `
            <div class="header">
                <div class="${cssClass.iconContainer}">
                    <i class="material-icons ${cssClass.icon}">face</i>
                </div>
                <div class="${cssClass.titleContainer}">
                    <div class="${cssClass.title}">
                        <div>${options.title}</div>
                        <i class="material-icons ${cssClass.arrow}">keyboard_arrow_right</i>
                    </div>
                    <div class="${cssClass.subtitle}">
                        ${options.subtitle}
                    </div>
                </div>
            </div>
            <div class="${cssClass.body}">
                <div class="${cssClass.carousel}">
                    <div class="${cssClass.cardContainer}">

                    </div>
                    <div class="${cssClass.leftArrow}">
                        <i class="material-icons ${cssClass.arrow}">keyboard_arrow_left</i>
                    </div>
                    <div class="${cssClass.rightArrow}">
                        <i class="material-icons ${cssClass.arrow}">keyboard_arrow_right</i>
                    </div>
                </div>
            </div>`;

        this.containerEl = document.getElementById(options.container);
        this.containerEl.className = cssClass.container;
        // add the tempate to the root / container
        this.containerEl.appendChild(htmlToElement(template));
        this.cardContainerEl = this.containerEl.getElementByClassName(cssClass.cardContainer);
        // scrolling overlays
        this.leftArrowEl = this.containerEl.getElementByClassName(cssClass.leftArrow);
        this.rightArrowEl = this.containerEl.getElementByClassName(cssClass.rightArrow);
        // bind the scrolling events
        this.leftArrowEl.addEventListener('click', () => this.animateSlide(this.cardContainerEl, -300, 1000));
        this.rightArrowEl.addEventListener('click', () => {
            this.animateSlide(this.cardContainerEl, 300, 1000)
                // when animation done
                .then(hasReached => {
                    if (hasReached) {

                    }
                });
        });
    }

    /**
     * @param {HTMLElement} element slide container
     * @param {number} slideDistance how many pixels to slide
     * @param {*} durationMs animation duration
     * @returns {boolean} true if the slide has reach to the right end
     */
    async animateSlide(element, slideDistance, durationMs) {
        // to prevent interval replication
        if (this.sliderIntervalId) {
            window.clearInterval(this.sliderIntervalId);
            this.sliderIntervalId = null;
        }
        let timeUnitMs = 5;
        let shiftPerUnit = slideDistance / (durationMs / timeUnitMs);
        let sinceTheBeginning = 0;
        this.sliderIntervalId = setInterval(() => {
            element.scrollLeft += shiftPerUnit
            sinceTheBeginning += timeUnitMs;
            if (sinceTheBeginning >= durationMs) {
                window.clearInterval(intervalId);
                return true;
            }
        }, timeUnitMs);

        return false;
    }

    async next() {

    }

    async addCard() {

    }

    async addPlaceholders() {

    }
}