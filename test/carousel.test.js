import { Carousel, Options } from '../src/carousel';
import chai from 'chai';
// https://github.com/rstacruz/jsdom-global
// to inject document and window objects in the test
import 'jsdom-global/register';

describe('Carousel', () => {
    // SUT
    let carousel;

    /**
     * @returns {Options}
     */
    let getDummyOptions = ({ container, title, subtitle, fetchCards }) => {
        return {
            container: container,
            title: title,
            subtitle: subtitle,
            fetchCards: fetchCards
        };
    };

    /**
     * @returns {Carousel}
     */
    let getDummyCarousel = ({ container, title, subtitle, fetchCards } = {
        container: 'my-carousel',
        title: 'title',
        subtitle: 'subtitle',
        fetchCards: () => Promise.resolve([])
    }) => {
        // dummy options
        let dummyOptions = getDummyOptions({ container: container, title: title, subtitle, fetchCards: fetchCards});
        // dummy HTML content
        document.body.innerHTML = `<html><body><div id="my-carousel"></div></body></html>`;
        // create carousel for each test case
        return new Carousel(dummyOptions);
    };

    beforeEach(() => {
        carousel = getDummyCarousel();
    });

    it('should create', () => {
        chai.should().exist(carousel);
    });

    it('should assign css properties', () => {
        chai.expect(carousel.containerEl.className).to.equal(carousel.css.container);
        chai.expect(carousel.cardContainerEl.className).to.equal(carousel.css.cardContainer);
        // todo .. add more comparisons
    });
});