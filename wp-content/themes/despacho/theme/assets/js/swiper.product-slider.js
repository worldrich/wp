jQuery(document).ready(function($){
    "use strict";

    //Swiper products slider
    $('.swiper-products').each(function(){

        var left_border_width = parseInt($('.swiper-container .swiper-slide .swiper-slide-image .opacity').css('borderLeftWidth').replace('px', ''));
        var right_border_width = parseInt($('.swiper-container .swiper-slide .swiper-slide-image .opacity').css('borderRightWidth').replace('px', ''));
        var border_width = (left_border_width + right_border_width);

        var top_border_width = parseInt($('.swiper-container .swiper-slide .swiper-slide-image .opacity').css('borderTopWidth').replace('px', ''));
        var bottom_border_width = parseInt($('.swiper-container .swiper-slide .swiper-slide-image .opacity').css('borderBottomWidth').replace('px', ''));
        var border_height = top_border_width + bottom_border_width;

        var window_width = $(window).width();

        var slider = $(this),
            items = slider.data('items'),
            overflow = slider.data('overflow'),
            autoplay = slider.data('autoplay'),
            swiper = slider.parent().swiper({
                //Your options here:

                mode:'horizontal',
                autoplay: autoplay,
                loop: true,
                loopAdditionalSlides: 2,
                slidesPerView : items,
                calculateHeight : true,
                grabCursor: true,
                autoResize: true, //Sinc to Browser Resize/Resolution -> Important for Responsive
                onInit: function() {
                    initialize_swiper_slider(border_width, border_height);
                },
                onFirstInit: function() {
                    //IE FIX --> Slider initialization for IE Browser
                    if($.browser.msie) {
                        initialize_swiper_slider(border_width, border_height);
                    }
                }
            });

        //Check Browser Resolution for All Browser
        if ( window_width > 767 ) slider.parent().css('overflow', overflow);

        if ( window_width > 480 &&  window_width < 768 && items != 2 ) {
            swiper.params.slidesPerView = 2;
            swiper.reInit();
        }else if( window_width <= 480 && items != 1) {
            swiper.params.slidesPerView = 1;
            swiper.reInit();
        }

        //Add background opacity -> IE8 Fix
        $('<div class="opacity left" />').appendTo( slider.parent() ).css('opacity', 0.7);
        $('<div class="opacity right" />').appendTo( slider.parent() ).css('opacity', 0.7);

        //Change slider options on Browser Resize
        $(window).on('resize', function(){
            if ( $(window).width() > 767 ) {
                swiper.params.slidesPerView = items;
                slider.parent().css('overflow', overflow);
            } else if(  $(window).width() > 480 &&  $(window).width() < 768 ) {
                if( items != 2 ){
                    swiper.params.slidesPerView = 2;
                }
                slider.parent().css('overflow', 'hidden');
            } else {
                if( items != 1 ){
                    swiper.params.slidesPerView = 1;
                }
                slider.parent().css('overflow', 'hidden');
            }
        });
    });

    function initialize_swiper_slider(border_width, border_height) {
        //Initial configuration (Not IE Browser) and Responsive (All Browser)

        var resize_width = $('.swiper-slide-wrapper img.yit-image').width(),
            resize_height = $('.swiper-slide-wrapper img.yit-image').height();

        //Check Height and Width for all Browser
        if(!$.browser.opera && !$.browser.safari){

            resize_height = resize_height - border_height;
            resize_width = resize_width - border_width;

        }else if($.browser.opera){

            resize_width = resize_width - border_width;
        }

        $('.swiper-slide-wrapper div.opacity').height( resize_height ).width( resize_width );
    }

});
