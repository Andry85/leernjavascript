class Slider {
    constructor(title, countSlides) {
        this.title = title;
        this.countSlides = countSlides;
    }

    height = 0;
    #borderWidth = 10;

    static originName = "Slick slider";

    start() {
        console.log(`I start to work and my`);
    }

    run() {
        return this;
    }

}

const prettySlider = new Slider('Owl slider', 5);

console.log(prettySlider.title);
console.log(prettySlider.start());
console.log(prettySlider.run());
console.log(prettySlider.height);

console.log(prettySlider);
console.log(prettySlider.__proto__);
console.log(Slider.prototype);
console.log(prettySlider.__proto__ === Slider.prototype);


class MiniSlider extends Slider {;
    constructor(title, countSlides,  age) {
        super(title, countSlides); // вызывает конструктор super класса и передаёт параметр title and countSlides
        this.age = age;
    }

    start() {
        super.start()
    }
}

const myMini = new MiniSlider('Mini slick', 5, 25);

console.log(myMini.title);
console.log(myMini.age);
console.log(myMini.start());
console.log(myMini);