function ready(fn) {
  if (document.readyState != 'loading'){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

ready(function() {
    // Fixes anchor scrolling
    document.querySelectorAll('.nav-link', '.btn-link').forEach(function(link) {
        link.addEventListener('click', function(event) {
            var targetHash = event.currentTarget.getAttribute("href");
            if(targetHash[0] !== "#") {
                return;
            }
            
            event.preventDefault();
            event.stopPropagation();


            var elem = document.querySelector(targetHash);
            if(!elem) {
                return;
            }

            window.scrollTo({
                top: elem.offsetTop,
                behavior: "smooth"
            });

            history.pushState(null, null, targetHash);
        });
    });
});
