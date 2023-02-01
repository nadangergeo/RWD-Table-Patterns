function ready(fn) {
  if (document.readyState != "loading"){
    fn();
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
}

ready(function() {
    // Fixes anchor scrolling
    document.querySelectorAll([".nav-link", ".btn-link"]).forEach(function(link) {
        link.addEventListener('click', function(event) {
            var targetHash = event.currentTarget.getAttribute("href");
            if(targetHash[0] !== "#") {
                return;
            }
            
            event.preventDefault();
            event.stopPropagation();

            $(".navbar-collapse").collapse("hide");
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

    // Init responsive table
    $('#group-test-wrapper').responsiveTable({
        sortable: true, // example option
        compareFunction: function(a, b, dir) { // custom compare function
          // console.log(a[0], b[0], dir);
          return a[0].localeCompare(b[0], undefined, { numeric: true }) < 0 ? -dir : dir;
        }
    });
});
