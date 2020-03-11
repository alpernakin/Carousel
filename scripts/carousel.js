class Carousel {

    containerClassName = "carousel-container";

    containerElement = null;

    constructor({ container, title, subtitle, fetchCards }) {
        this.containerId = container;
        this.titleText = title;
        this.subtitleText = subtitle;
        this.fetchCards = fetchCards;

        this.createContainer(container);
    }

    createContainer(containerId) {
        this.container = new Container(document.getElementById(containerId));

        this.container.addHeader("face", this.titleText, this.subtitleText);
    }

    try() {
        let el = document.getElementById("");
        document.createElement("")
        el.appendChild(document.getElementById(""));
    }
}

class Container {

    element;
    header;
    body;

    /**
     * @param {HTMLElement} element 
     */
    constructor(element) {
        this.element = element;
    }

    addHeader(icon, title, subtitle) {
        let header = document.createElement
    }
}

class Header {
    className = "header";
    element;
    icon;

    /**
     * @param {string} iconName icon name
     * @param {*} title top title
     * @param {*} subtitle subtitle
     */
    constructor(iconName, title, subtitle) {
        // create the header element
        this.element = document.createElement("div");
        this.element.className = this.className;

        iconContainer.appendChild(this.createIconContainer(iconName));
    }

    /**
     * create icon with the container
     * @param {string} iconName
     * @returns {HTMLElement} the header element
     */
    createIconContainer(iconName) {
        // create the icon container
        let iconContainerEl = document.createElement("div");
        iconContainerEl.className = "icon-container";
        // create the icon
        let iconEl = document.createElement("i");
        iconEl.className = "material-icons icon";
        iconEl.innerHTML = iconName;

        iconContainerEl.appendChild(iconEl);

        return iconContainerEl;
    }

    /**
     * create the title and subtitle
     * @param {string} title 
     * @param {string} subtitle 
     * @returns {HTMLElement}
     */
    createTitleContainer(title, subtitle) {
        // the container
        let titleContainerEl = document.createElement("div");
        titleContainerEl.className = "titleContainer";
        // title
        let titleEl = document.createElement("div");

    }
}

class Body {

}