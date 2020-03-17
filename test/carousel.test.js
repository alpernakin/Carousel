import { Carousel, Options } from '../src/carousel';
import { FakeRestApi } from '../src/fakeRestApi';
import chai from 'chai';
// https://github.com/rstacruz/jsdom-global
// to inject document and window objects in the test
import 'jsdom-global/register';

describe('Carousel', () => {
    /** 
     * @param {Options} options
     * @returns {Carousel} dummy carousel object 
     */
    let createDummyCarousel = (options = {
        chunkSize: 6,
        container: 'my-carousel',
        title: 'title',
        subtitle: 'subtitle',
        fetchCards: (_chunkSize) => new FakeRestApi().request(_chunkSize, 1, 0)
    }) => {
        // dummy HTML content
        document.body.innerHTML = `<html><body><div id="my-carousel"></div></body></html>`;
        // create the carousel
        return new Carousel(options);
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
        chai.expect(carousel.containerEl.className).equal(carousel.css.container);
        chai.expect(carousel.cardContainerEl.className).equal(carousel.css.cardContainer);
        // todo .. add more comparisons
    });

    it('should load cards', (done) => {
        let carousel = createDummyCarousel({
            container: 'my-carousel',
            chunkSize: 4,
            // less card than the chunk size please (we don't need a see more card here)
            fetchCards: (_chunkSize) => new FakeRestApi().request(2)
        });
        // after the first batch loaded
        carousel.listenFirstBatchLoad(event => {
            // they should exist
            chai.should().exist(event.detail.cards);
            // and must match with number of cards
            chai.expect(carousel.numberOfCards).equal(event.detail.cards.length);
            // done with the test
            done();
        });
    });

    it('should add a card', (done) => {
        let carousel = createDummyCarousel();
        // after the first batch loaded
        carousel.listenFirstBatchLoad(() => {
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
        carousel.listenFirstBatchLoad(event => {
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

    it('should add a see more card when cards in chunk size are fetched', (done) => {
        // the fake rest api will return in chunk size
        let carousel = createDummyCarousel({
            chunkSize: 6,
            container: 'my-carousel',
            fetchCards: (_chunkSize) => new FakeRestApi().request(_chunkSize, _chunkSize, 0)
        });
        // after the first batch loaded
        carousel.listenFirstBatchLoad(() => {
            // if the rest api returns in the chunk size
            // the card at the end of the carousel must be see more
            let card = carousel.getCardElements().item(carousel.chunkSize);
            chai.expect(card.className).to.contains(carousel.css.seeMore);
            // done with the test
            done();
        });
    });

    it('should know the card width', (done) => {
        let carousel = createDummyCarousel();
        // after the first batch loaded
        carousel.listenFirstBatchLoad(event => {
            // width of the first card must match with the card width in carousel
            chai.expect(event.detail.cards[0].clientWidth).equal(carousel.cardWidth);
            // done with the test
            done();
        });
    });

    it('should display the left and right arrows accordingly', (done) => {
        let carousel = createDummyCarousel({
            chunkSize: 6,
            container: 'my-carousel',
            fetchCards: (chunkSize) => new FakeRestApi().request(chunkSize, chunkSize, 0)
        });
        // after the first batch loaded
        carousel.listenFirstBatchLoad(() => {
            // should not display the left arrow
            carousel.mostLeftVisibleIndex = 0;
            chai.expect(carousel.isLeftSliderArrowVisible()).equal(false);
            // should show the left arrow
            carousel.mostLeftVisibleIndex = 1;
            chai.expect(carousel.isLeftSliderArrowVisible()).equal(true);
            // should not display the right arrow
            // 7 cards are expected with see more card 6 + 1
            carousel.mostRightVisibleIndex = 6;
            chai.expect(carousel.isRightSliderArrowVisible()).equal(false);
            // should display the right arrow
            carousel.mostRightVisibleIndex = 5;
            chai.expect(carousel.isRightSliderArrowVisible()).equal(true);
            // done with the test
            done();
        });
    });

    it('should move indexes properly', (done) => {
        let carousel = createDummyCarousel({
            container: 'my-carousel',
            fetchCards: (_chunkSize) => new FakeRestApi().request(6, 6, 0)
        });
        // after the first batch loaded
        carousel.listenFirstBatchLoad(() => {
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

    it('should move left properly', (done) => {
        let carousel = createDummyCarousel();
        // after the first batch loaded
        carousel.listenFirstBatchLoad(() => {
            // stub the method, as we don't need any html activity
            carousel.slideTo = (_element) => {}

            carousel.mostRightVisibleIndex = 7;
            carousel.mostLeftVisibleIndex = 4;
            // it should move 4 cards left
            carousel.prev(5);
            chai.expect(carousel.mostRightVisibleIndex).equal(3);
            chai.expect(carousel.mostLeftVisibleIndex).equal(0);
            // it should not move left
            carousel.prev(1);
            chai.expect(carousel.mostRightVisibleIndex).equal(3);
            chai.expect(carousel.mostLeftVisibleIndex).equal(0);
            // let's move 2 cards right
            carousel.next(2);
            // it should move 2 cards left, not 4
            carousel.prev(4);
            chai.expect(carousel.mostRightVisibleIndex).equal(3);
            chai.expect(carousel.mostLeftVisibleIndex).equal(0);
            // done with the test
            done();
        });
    });

    it('should move right properly', (done) => {
        let carousel = createDummyCarousel({
            chunkSize: 6,
            container: 'my-carousel',
            fetchCards: (_chunkSize) => new FakeRestApi().request(_chunkSize, _chunkSize, 0)
        });
        // after the first batch loaded
        carousel.listenFirstBatchLoad(() => {
            // stub the method, as we don't need html activity
            carousel.slideTo = (_element) => {}

            // the total number of cards will be 6 + 1 = 7 because of see more card

            carousel.mostRightVisibleIndex = 3;
            carousel.mostLeftVisibleIndex = 0;
            // it should move 3 cards right
            carousel.next(3);
            chai.expect(carousel.mostRightVisibleIndex).equal(6);
            chai.expect(carousel.mostLeftVisibleIndex).equal(3);
            // it should not move
            carousel.next(1);
            chai.expect(carousel.mostRightVisibleIndex).equal(6);
            chai.expect(carousel.mostLeftVisibleIndex).equal(3);
            // move the slide 2 cards left
            carousel.prev(2);
            // it should move 2 cards right, not 3
            carousel.next(3);
            chai.expect(carousel.mostRightVisibleIndex).equal(6);
            chai.expect(carousel.mostLeftVisibleIndex).equal(3);
            // done with the test
            done();
        });
    });
});