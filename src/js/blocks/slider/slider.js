class Slider {
    constructor(id, gap, count) {
        this.id = id;
        this.gap = gap;
        this.count = count;
    }

    initSlider() {
        const container = document.getElementById(this.id);
        container.classList.add('as-slider');
        const code = container.innerHTML;
        container.innerHTML = '';

        
        const wrapper = document.createElement('div');
        wrapper.classList.add('as-slider__wrapper');
        container.append(wrapper);
        wrapper.insertAdjacentHTML('afterBegin', code);
        const slides = wrapper.children;
        let totalSlidesWidth = 0;
        if (slides.length > 0) {
            for(let item of slides) {
                item.style.paddingRight = this.gap + 'px';
            }


            for (let i = 0; i < this.count; i++) {
                totalSlidesWidth = totalSlidesWidth + slides[i].offsetWidth;
            }


        }
        wrapper.style.width = totalSlidesWidth + 'px';
        console.log(totalSlidesWidth);
    }
}


const mySlider = new Slider('slider', 10, 3);
mySlider.initSlider();