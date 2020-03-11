class Carousel {

    constructor({ container, title, subtitle, fetchCards }) {

        this.setContainer(container);

        this.title = title;
        this.subtitle = subtitle;

        this.fetchCards = fetchCards;
    }

    setContainer(containerId) {
        this.containerId = containerId;
        this.containerEl = document.getElementById(containerId);
    }

    setTitle(title) {

        
    }

    setSubtitle() {

    }

    setCards() {

    }

}

window.onload = () => {

}