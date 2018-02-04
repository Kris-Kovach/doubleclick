'use strict';


// Burger menu

var mainNavToggler = document.querySelector('.js-main-nav-toggler');
var mainNav = document.querySelector('.js-main-nav');

var mainNavVisibleToggle = function (event) {
  event.preventDefault();
  mainNavToggler.classList.toggle('main-nav-toggler--close');
  mainNav.classList.toggle('main-nav--visible');
};

if (mainNavToggler) {
  mainNavToggler.addEventListener('click', mainNavVisibleToggle);
}

// Responsive tabs

$('.js-products-tabs').responsiveTabs({
  active: 0
});

$('.js-contacts-tabs').responsiveTabs({
  active: 0
});

// Map

if ($('.js-contacts-map').length) {
  var map;

  function initMap() {
    map = new google.maps.Map(document.querySelector('.js-contacts-map'), {
      center: {lat: 59.950173, lng: 30.294733},
      zoom: 13,
      scrollwheel: false
    });

    var iconImage = {
      url: 'img/map-pointer.png',
      size: new google.maps.Size(73, 62),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(53, 62)
    };

    var offices = [
      {
        position: new google.maps.LatLng(59.950195, 30.294754)
      },
      {
        position: new google.maps.LatLng(55.737482, 37.636704)
      }
    ];

    offices.forEach(function (office) {
      var marker = new google.maps.Marker({
        position: office.position,
        icon: iconImage,
        map: map
      });
    });
  }

  var contactsTabLink = $('.js-contacts-tab');

  contactsTabLink.on('click', function (){
    var newLat = $(this).data('lat');
    var newLng = $(this).data('lng');

    map.setCenter({
      lat : newLat,
      lng : newLng
    });
  });
}


// Change map center

// var contactsTabLink = $('.js-contacts-tab');
//
// contactsTabLink.on('click', function (){
//   var newLat = $(this).data(lat);
//   var newLng = $(this).data(lng);
//
//   map.setCenter({
//     lat : newLat,
//     lng : newLng
//   });
// });

