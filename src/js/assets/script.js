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

  $.validator.addMethod("minlenghtphone", function (value, element) {
    return value.replace(/\D+/g, '').length > 10;
  });

  $.validator.addMethod("requiredphone", function (value, element) {
    return value.replace(/\D+/g, '').length > 1;
  });

  $('.js-callback-form').validate({
    rules: {
      fullname: "required",
      email: "required",
      phone: {
        requiredphone: true,
        minlenghtphone: true
      }
    },
    errorPlacement: function (error, element) {
      element.attr("placeholder", error[0].outerText);
    },
    messages: {
      fullname: "Обязательное поле",
      phone: "Некорректный формат телефона",
      email: "Некорректный формат e-mail"
    },
    submitHandler: function (form, evt) {
      evt.preventDefault();
      $('.callback__inner').hide();
      $('.success-message').show();
    }
  });

  $('.success-message__close').on('click', function (){
    $('.callback__inner').show();
    $('.success-message').hide();
  });

// Smooth scroll

  $('.main-nav__link').on('click',function(e){
    e.preventDefault();
    console.log(true);
    $('html, body').animate({scrollTop:$(this.hash).offset().top}, 500);
  });

// Icons animation
  if ($('.advantages__img').length) {
    $(window).on('scroll', function () {
      if ($(window).scrollTop() >= ($(".advantages__items").offset().top - ($(window).height()))) {
        if (!$(".advantages__items").hasClass("animated")) {
          $('.advantages__img').each(function () {
            $(this).css('visibility', 'visible').hide().fadeIn(3000);
          });
        }
        $(".advantages__items").addClass("animated");
      }
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
