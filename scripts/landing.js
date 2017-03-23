 var pointsArray = document.getElementsByClassName('point');

 var revealPoint = function(points) {
         point.style.opacity = 1;
         point.style.transform = "scaleX(1) translateY(0)";
         point.style.msTransform = "scaleX(1) translateY(0)";
         point.style.WebkitTransform = "scaleX(1) translateY(0)";
 };

var animatePoints = function(points){
    forEach(points, revealPoint);
};


window.onload = function(){
    //animate points on a tall screen
    if(window.innerHeight > 950) {
        animatePoints(pointsArray);
    }
    
    window.addEventListener("scroll", function(event) {
        if (pointsArray[0].getBoundingClientRect().top <= 500) {
            animatePoints(pointsArray);
        }
    });
}