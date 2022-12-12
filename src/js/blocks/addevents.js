// document.body.addEventListener("click", function(event){
//     console.log('click on document');
//     // event.stopImmediatePropagation(); // зупиняє інші події click на даному елементі
//     console.log("target = " + event.target.tagName + ", event.currentTarget=" + event.currentTarget.tagName);

// }, true);


// document.addEventListener("click", function(){
//     console.log('another hendler'); // не виконається так як в іншому обробнику визван stopImmediatePropagation
// });

// document.addEventListener("keydown", function(){
//     console.log('keydown hendler');
// });

// const sliderEl = document.querySelector('#slider');

// sliderEl.addEventListener("click", function(event){
//     console.log('slider click: event.target ', event.target);
//     console.log('slider click: event.target.tagName', event.target.tagName);
//     console.log('slider click: event.currentTarget', event.currentTarget);
// }, true);

const parent = document.querySelector('.parent');
const child = document.querySelector('.child');

parent.addEventListener("click", function(event){
    console.log('event.currentTarget', event.currentTarget);
    
});

child.addEventListener("click", function(event){
    console.log('event.currentTarget', event.currentTarget);
    event.stopPropagation();
});



