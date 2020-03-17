import { Carousel, Options } from '../src/carousel';
import { FakeRestApi } from '../src/fakeRestApi';
import chai from 'chai';
// https://github.com/rstacruz/jsdom-global
// to inject document and window objects in the test
import 'jsdom-global/register';

describe('Carousel', () => {
    /** @returns {Options} dummy options */
    let createDummyOptions = ({ container, title, subtitle, fetchCards }) => {
        return {
            container: container,
            title: title,
            subtitle: subtitle,
            fetchCards: fetchCards
        };
    };

    /** @returns {Carousel} dummy carousel object */
    let createDummyCarousel = ({ chunkSize, container, title, subtitle, fetchCards } = {
        chunkSize: 6,
        container: 'my-carousel',
        title: 'title',
        subtitle: 'subtitle',
        fetchCards: (size) => new FakeRestApi().request(chunkSize, 1, 0)
    }) => {
        // dummy options
        let dummyOptions = createDummyOptions({ container: container, title: title, subtitle, fetchCards: fetchCards });
        // dummy HTML content
        document.body.innerHTML = `<html><body><div id="my-carousel"></div></body></html>`;
        // create the carousel
        return new Carousel(dummyOptions);
    };

    beforeEach(() => { });

    it('should create', () => {
        let carousel = createDummyCarousel();
        chai.should().exist(carousel);
    });

    it('should create elements', () => {
        let carousel = createDummyCarousel();
        chai.should().exist(carousel.containerEl);
        chai.should().exist(carousel.cardContainerEl);
        chai.should().exist(carousel.leftArrowEl);
        chai.should().exist(carousel.rightArrowEl);
        // todo .. add more element checks
    });

    it('should assign css properties', () => {
        let carousel = createDummyCarousel();
        chai.expect(carousel.containerEl.className).to.equal(carousel.css.container);
        chai.expect(carousel.cardContainerEl.className).to.equal(carousel.css.cardContainer);
        // todo .. add more comparisons
    });

    it('should load cards', (done) => {
        let carousel = createDummyCarousel();
        // after the first batch loaded
        carousel.onFirstBatchLoaded(() => {
            let cards = carousel.getCardElements();
            // they should exist
            chai.should().exist(cards);
            // done with the test
            done();
        });
    });

    it('should add a card', (done) => {
        let carousel = createDummyCarousel();
        // after the first batch loaded
        carousel.onFirstBatchLoaded(() => {
            let numberOfCards = carousel.numberOfCards;
            // dummy card object
            let dummyCard = carousel.createCardElement({});
            // add in the carousel
            carousel.addCard(dummyCard);
            // expect the number of current cards is equal to the counter
            let cards = carousel.getCardElements();
            chai.expect(cards.length).to.equal(numberOfCards + 1);
            // done with the test
            done();
        });
    });

    it('should remove a card', (done) => {
        let carousel = createDummyCarousel();
        // after the first batch loaded
        carousel.onFirstBatchLoaded((event) => {
            let numberOfCards = carousel.numberOfCards;
            // remove any card from the carousel
            carousel.removeCard(event.detail.cards[0]);
            // expect the number of current cards is equal to the counter
            let cards = carousel.getCardElements();
            chai.expect(cards.length).to.equal(numberOfCards - 1);
            // done with the test
            done();
        });
    });

    it('should add a see more card on chunk size', (done) => {
        // the fake rest api will return in chunk size
        let carousel = createDummyCarousel({
            chunkSize: 6,
            container: 'my-carousel',
            fetchCards: (chunkSize) => new FakeRestApi().request(chunkSize, chunkSize, 0)
        });
        // after the first batch loaded
        carousel.onFirstBatchLoaded(() => {
            // if the rest api returns in the chunk size
            // the card at the end of the carousel must be see more
            let card = carousel.getCardElements().item(carousel.chunkSize);
            chai.expect(card.className).to.contains(carousel.css.seeMore);
            // done with the test
            done();
        });
    });

    it('should measure the card size properly', (done) => {
        let carousel = createDummyCarousel();
        // after the first batch loaded
        carousel.onFirstBatchLoaded(() => {
            let firstCard = carousel.getCardElements()[0];
            // width of the first card must match with the card width in carousel
            chai.expect(firstCard.clientWidth).to.equal(carousel.cardWidth);
            // done with the test
            done();
        });
    });

    it('should display left and right slider arrows accordingly', () => {
        let carousel = createDummyCarousel({
            chunkSize: 6,
            container: 'my-carousel',
            fetchCards: (chunkSize) => new FakeRestApi().request(chunkSize, chunkSize, 0)
        });

        // todo add display check
    });

    it('should move indexes properly', (done) => {
        let carousel = createDummyCarousel({
            container: 'my-carousel',
            fetchCards: (_chunkSize) => new FakeRestApi().request(6, 6, 0)
        });
        // after the first batch loaded
        carousel.onFirstBatchLoaded(() => {
            carousel.mostRightVisibleIndex = 3;
            carousel.mostLeftVisibleIndex = 1;
            // move 2 items forward
            carousel.moveIndexes(2);
            chai.expect(carousel.mostRightVisibleIndex).equal(5);
            chai.expect(carousel.mostLeftVisibleIndex).equal(3);
            // move 3 items backward
            carousel.moveIndexes(-3)
            chai.expect(carousel.mostRightVisibleIndex).equal(2);
            chai.expect(carousel.mostLeftVisibleIndex).equal(0);
            // done with the test
            done();
        });
    });

    it('should not move left', (done) => {
        let carousel = createDummyCarousel({
            container: 'my-carousel',
            fetchCards: (_chunkSize) => new FakeRestApi().request(10, 10, 0)
        });
        // after the first batch loaded
        carousel.onFirstBatchLoaded(() => {
            // stub the method, as we don't need html activity
            carousel.slideTo = (_element) => {}
            // number of visible cards in the carousel
            carousel.numberOfVisibleCards = 4;
            carousel.mostRightVisibleIndex = 3;
            carousel.mostLeftVisibleIndex = 0;
            // as the carousel is on the most left, it should not move
            carousel.prev(5);
            chai.expect(carousel.mostRightVisibleIndex).to.equal(3);
            chai.expect(carousel.mostLeftVisibleIndex).to.equal(0);
            // done with the test
            done();
        });
    });

    it('should move left', (done) => {
        let carousel = createDummyCarousel({
            container: 'my-carousel',
            fetchCards: (_chunkSize) => new FakeRestApi().request(10, 10, 0)
        });
        // after the first batch loaded
        carousel.onFirstBatchLoaded(() => {
            // stub the method, as we don't need html activity
            carousel.slideTo = (_element) => {}
            // number of visible cards in the carousel
            carousel.numberOfVisibleCards = 4;
            carousel.mostRightVisibleIndex = 7;
            carousel.mostLeftVisibleIndex = 4;
            // as the carousel is on the most left
            carousel.prev(5);
            chai.expect(carousel.mostRightVisibleIndex).to.equal(3);
            chai.expect(carousel.mostLeftVisibleIndex).to.equal(0);
            // done with the test
            done();
        });
    });

    it('should move right', (done) => {
        let carousel = createDummyCarousel({
            container: 'my-carousel',
            fetchCards: (_chunkSize) => new FakeRestApi().request(6, 6, 0)
        });
        // after the first batch loaded
        carousel.onFirstBatchLoaded(() => {
            // stub the method, as we don't need html activity
            carousel.slideTo = (_element) => {}
            // 3rd element is on the most right of the carousel
            carousel.mostRightVisibleIndex = 2;

            carousel.next(3);
            chai.expect(carousel.mostRightVisibleIndex).to.equal(5);
            chai.expect(carousel.mostLeftVisibleIndex).to.equal(3);
            // done with the test
            done();
        });
    });
});