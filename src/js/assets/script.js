$(document).ready(function (){
  // Burger menu
  $('.js-main-nav-toggler').on('click', function (event) {
    event.preventDefault();
    $(this).toggleClass('main-nav-toggler--close');
    $('.js-main-nav').toggleClass('main-nav--visible');
  });

  $('.js-main-nav-link').on('click', function (event) {
    event.preventDefault();
    $('.js-main-nav-toggler').removeClass('main-nav-toggler--close');
    $('.js-main-nav').removeClass('main-nav--visible');
  });

// Responsive tabs

  $('.js-products-tabs').responsiveTabs({
    active: 0
  });

// Tabs

  $('.js-contacts-tab').click(function (e) {
    e.preventDefault();
    var tab_id = $(this).attr('href');

    $('.js-contacts-tab').removeClass('contacts__tabs-link--active');
    $('.contacts__tabs-content').removeClass('contacts__tabs-content--active');

    $(this).addClass('contacts__tabs-link--active');
    $(tab_id).addClass('contacts__tabs-content--active');
  });

  if ($('.contacts__tabs-list').length) {
    $('.contacts__tabs-item:first-child .contacts__tabs-link').click();
  }

  // Inputmask

  $('.js-field-phone').inputmask({"mask": "+7 (999) 999-9999"});

// Validation

  jQuery.validator.addMethod("phoneRU", function (phone_number, element) {
    phone_number = phone_number.replace(/\s+/g, "");
    phone_number = phone_number.replace('(', "");
    phone_number = phone_number.replace(')', "");
    phone_number = phone_number.replace(/-/g, "");
    return this.optional(element) || phone_number.length > 9 &&
      phone_number.match(/(\+7|8)9([0-9]{2})[1-9]([0-9]{6})/);
  }, "Введите номер телефона");

  $('.js-callback-form').validate({
    rules: {
      fullname: "required",
      email: {
        email: true,
        require_from_group: [1, ".validation-group"]
      },
      phone: {
        phoneRU: true,
        require_from_group: [1, ".validation-group"]
      }
    },
    errorPlacement: function (error, element) {
      element.attr("placeholder", error.text());
    },
    messages: {
      fullname: "Представьтесь, пожалуйста",
      phone: "Введите номер телефона",
      email: "Введите e-mail"
    }
  });

// Smooth scroll

  $('.main-nav__link').on('click',function(e){
    e.preventDefault();
    console.log(true);
    $('html, body').animate({scrollTop:$(this.hash).offset().top}, 500);
  });

// Icons animation

  if ($('.advantages__img').length) {
    $(window).scroll( function(){
      $('.advantages__img').each( function(i){
        var bottom_of_object = $(this).position().top + $(this).outerHeight();
        var bottom_of_window = $(window).scrollTop() + $(window).height();
        if( bottom_of_window > bottom_of_object ){
          $(this).animate({'opacity':'1'},2000);
        }
      });
    });
  }

});



// Map

if ($('.js-contacts-map').length) {
  var map;

  function initMap() {
    map = new google.maps.Map(document.querySelector('.js-contacts-map'), {
      center: {lat: 59.950173, lng: 30.294733},
      zoom: 13,
      scrollwheel: false,
      styles: [{featureType:"administrative",elementType:"all",stylers:[{visibility:"on"},{saturation:-100},{lightness:20}]},{featureType:"road",elementType:"all",stylers:[{visibility:"on"},{saturation:-100},{lightness:40}]},{featureType:"water",elementType:"all",stylers:[{visibility:"on"},{saturation:-10},{lightness:30}]},{featureType:"landscape.man_made",elementType:"all",stylers:[{visibility:"simplified"},{saturation:-60},{lightness:10}]},{featureType:"landscape.natural",elementType:"all",stylers:[{visibility:"simplified"},{saturation:-60},{lightness:60}]},{featureType:"poi",elementType:"all",stylers:[{visibility:"off"},{saturation:-100},{lightness:60}]},{featureType:"transit",elementType:"all",stylers:[{visibility:"off"},{saturation:-100},{lightness:60}]}]
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

    google.maps.event.addDomListener(window, "resize", function () {
      var center = map.getCenter();
      google.maps.event.trigger(map, "resize");
      map.setCenter(center);
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
