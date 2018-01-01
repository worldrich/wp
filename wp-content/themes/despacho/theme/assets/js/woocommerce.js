jQuery(document).ready( function($){
    "use strict";

    var $body = $('body'),
        $topbar = $( document.getElementById('topbar') ),
        $header = $( document.getElementById('header') ),
        $products_sliders = $('.products-slider-wrapper, .categories-slider-wrapper'),
        $single_container = $('.fluid-layout.single-product .content');

    /*******************************************
     * PRODUCT THUMBNAILS LIGHTBOX
     *****************************************/
    var swipebox = function(){
        $('div.images a.zoom').swipebox({
            hideBarsDelay : 3000
        });
    };

    swipebox();
    $(document).on( 'qv_loader_stop', swipebox );

    /***************************************
     * UPDATE CALCULATE SHIPPING SELECT
    ***************************************/

    // FIX SHIPPING CALCULATOR SHOW
    $( '.shipping-calculator-form' ).show();

    /*************************
     * SHOP STYLE SWITCHER
     *************************/

    $('.content #list-or-grid').on( 'click', 'a', function(e) {
        var trigger = $(this),
            view = trigger.attr( 'class' ).replace('-view', '');

            $( 'ul.products li' ).removeClass( 'list grid' ).addClass( view );
            trigger.parent().find( 'a' ).removeClass( 'active' );
            trigger.addClass( 'active' );
            e.preventDefault();
            $.cookie( yit_shop_view_cookie, view );

            return false;
    });


    /***************************************************
     * ADD TO CART
     **************************************************/

    var $pWrapper = new Array(),
        $i=0,
        $j= 0,
        $private = false,
        $storageSafari = 'SafariPrivate',
        $storage = window.sessionStorage;

    try {
        $storage.setItem( $storageSafari, 'safari_is_private' );
        $storage.removeItem( $storageSafari );
    } catch (e) {
        if ( e.code == DOMException.QUOTA_EXCEEDED_ERR && $storage.length == 0) {
            $private = true
        } else {
            throw e;
        }
    }

    var add_to_cart = function() {

        $('ul.products').on('click', 'li.product .add_to_cart_button', function () {

            $pWrapper[$i] = $(this).parents('.product-wrapper');

            if( typeof yit.load_gif != 'undefined' ) {
                $pWrapper[$i].block({message: null, overlayCSS: {background: '#fff url(' + yit.load_gif + ') no-repeat center', opacity: 0.5, cursor: 'none'}});
            }
            else {
                $pWrapper[$i].block({message: null, overlayCSS: {background: '#fff url(' + woocommerce_params.ajax_loader_url.substring(0, woocommerce_params.ajax_loader_url.length - 7) + '.gif) no-repeat center', opacity: 0.3, cursor: 'none'}});
            }

            $i++;

            if( $private ) {
                setTimeout(function () {
                    $body.trigger('unblock_safari_private');
                }, 3000);
            }
        });

    };

    add_to_cart();
    $(document).on('yith-wcan-ajax-filtered', add_to_cart );

    $body.on( 'added_to_cart unblock_safari_private', function( fragmentsJSON, cart_hash ) {

        if ( typeof $pWrapper[$j] === 'undefined' )  return;

        var $thumb = $pWrapper[$j].find( '.thumb-wrapper' );

        var $ico = "<div class='added-to-cart-icon'><span>" + yit.added_to_cart_text + "</span></div>";

        $thumb.addClass( 'no-hover' );
        $thumb.append( $ico );

        setTimeout(function () {
            $thumb.find('.added-to-cart-icon').fadeOut(2000, function () {
                $thumb.removeClass( 'no-hover' );
                $(this).remove();
            });
        }, 3000);

        $pWrapper[$j].unblock();
        $j++;

    });

    /*******************************************
     * ADD TO WISHLIST
     *****************************************/

     $('ul.products, div.product div.summary').on( 'click', '.yith-wcwl-add-button a', function () {
         var to_load = $(this).parents('.product-wrapper, div.summary');
         if( typeof yit.load_gif != 'undefined' ) {
             to_load.block({message: null, overlayCSS: {background: '#fff url(' + yit.load_gif + ') no-repeat center', opacity: 0.3, cursor: 'none'}});
         }
         else {
             to_load.block({message: null, overlayCSS: {background: '#fff url(' + woocommerce_params.ajax_loader_url.substring(0, woocommerce_params.ajax_loader_url.length - 7) + '.gif) no-repeat center', opacity: 0.3, cursor: 'none'}});
         }

     });

    $body.on( 'added_to_wishlist', function() {
        var to_load = $(this).find('.product-wrapper, div.summary');
        to_load.unblock();

        // update counter on header
        if ( $('.wishlist_nav .cart-items-number').length ) {
            $.post( yit.ajaxurl, { action: 'yith_wcwl_update_counter' }, function( count ) {
                $('.wishlist_nav .cart-items-number').text( count );
            });
        }
    });

    /*************************
     * PRODUCTS SLIDER
     *************************/

    if( $.fn.owlCarousel && $.fn.imagesLoaded && $products_sliders.length ) {
        var product_slider = function(t) {

                t.imagesLoaded(function(){
                    var cols = t.data('columns') ? t.data('columns') : 4,
                        autoplay = ( t.attr('data-autoplay') == 'true' ) ? true : false;

                    var owl = t.find('.products').owlCarousel({
                        items             : cols,
                        responsiveClass   : true,
                        responsive:{
                            0 : {
                                items: 2
                            },
                            479 : {
                                items: 3
                            },
                            767 : {
                                items: 4
                            },
                            992 : {
                                items: cols
                            }
                        },
                        autoplay          : autoplay,
                        autoplayTimeout   : 2000,
                        autoplayHoverPause: true,
                        loop              : true
                    });

                    // Custom Navigation Events
                    t.on('click', '.es-nav-next', function () {
                        owl.trigger('next.owl.carousel');
                    });

                    t.on('click', '.es-nav-prev', function () {
                        owl.trigger('prev.owl.carousel');
                    });

                    if ( t.hasClass('products-slider-wrapper') ) {

                        var $index = 0;

                        t.find('.cloned ').each(function () {

                            var $button = $(this).find('.product-quick-view-button a'),
                                $id = $button.attr('id'),
                                $new_id = $id + '-' + $index++;

                            $button.attr( 'id', $new_id );
                        });

                        $(document).find('.product-quick-view-button a').off('click');
                    }

                });
        };

        // initialize slider in only visible tabs
        $products_sliders.each(function(){
            var t = $(this);
            if( ! t.closest('.panel.group').length || t.closest('.panel.group').hasClass('showing')  ){
                product_slider( t );
            }
        });

        $('.tabs-container').on( 'tab-opened', function( e, tab ) {
            product_slider( tab.find( $products_sliders ) );
        });

    }



    /*************************
     * VARIATIONS SELECT
     *************************/

    var variations_select = function() {
        // variations select
        if ($.fn.selectbox) {
            var form = $('form.variations_form');
            var select = form.find('select');

            if (form.data('wccl') || select.hasClass('yith_wccl_custom')) {
                select = select.filter(function () {
                    return $(this).data('type') == 'select'
                });
            }

            select.selectbox({
                effect: 'fade',
                onOpen: function () {
                    //$('.variations select').trigger('focusin');
                }
            });

            var update_select = function (event) {
                select.selectbox("detach");
                select.selectbox("attach");
            };


            // fix variations select
            form.on('woocommerce_update_variation_values', update_select);
            form.find('.reset_variations').on('click.yit', update_select);
        };


        variations_select();
    }




    /*************************
     * Login Form
     *************************/

    $('#login-form').on('submit', function(){
        var a = $('#reg_password').val();
        var b = $('#reg_password_retype').val();
        if(!(a==b)){
            $('#reg_password_retype').addClass('invalid');
            return false;
        }else{
            $('#reg_password_retype').removeClass('invalid');
            return true;
        }
    });

    /*************************
     * Widget Woo Price Filter
     *************************/

    if( typeof yit != 'undefined' && ( typeof yit.price_filter_slider == 'undefined' || yit.price_filter_slider == 'no' ) ) {
        var removePriceFilterSlider = function() {
            $( 'input#min_price, input#max_price' ).show();
            $('form > div.price_slider_wrapper').find( 'div.price_slider, div.price_label' ).hide();
        };

        $(document).on('ready', removePriceFilterSlider);
    }

    /****************************
     * COMPARE TOOLTIP
     ***************************/

    var $compare = $('.single-product .woocommerce.product.compare-button a');

    if( $compare.length ) {

        //init attr title
        $compare.attr( 'data-original-title', 'Add to compare' );

        $(document).on( 'yith_woocompare_open_popup', function(){
            $compare.attr( 'data-original-title', 'Added to compare' );
        });
    }


    /*************************
     * Quick view
     *************************/

    $(document).on( 'qv_loading', function(){
        if ( typeof yit.qv_loading_text == 'undefined' ) {
            return false;
        }

        var qv_modal    = $(document).find( '#yith-quick-view-modal' ),
            qv_overlay  = qv_modal.find( '.yith-quick-view-overlay');

        if ( ! qv_overlay.find('p').length ) {
            var p = $('<p />').text( yit.qv_loading_text )
            qv_overlay.append( p );
        }
    });


    /*************************
     * Header Search
     *************************/

    $.yit_trigger_search();
    $.yit_ajax_search();


    /***********************************
     * Jquery Scrollbar
     */

    if (yit_woocommerce.shop_minicart_scrollable == 'yes') {

        var create_popup_scrollbar = function () {
            $('.cart_wrapper .widget_shopping_cart_content').scrollbar();
        }

        create_popup_scrollbar();

        $(document).on('added_to_cart wc_fragments_refreshed wc_fragments_loaded', create_popup_scrollbar);

    }

    $(document).on('click', '.add-request-quote-button', function () {
        $(this).parent().removeClass('show')
    });

    /*************************
     * END PRODUCT QUICK VIEW
     *************************/
    if( (yit_woocommerce.version < '3.0.0' ) &&( yit_woocommerce.version >= '2.6.0'  )) {
        $(document).on('click', '.cart_totals.calculated_shipping .cart_update_checkout input[type="submit"]', function () {

            $('.woocommerce > form input[name="update_cart"]').click();

        });
    }
    if( yit_woocommerce.version >= '3.0.0') {
        var flexViewport = $('.flex-viewport');
        if( $('body').hasClass('single-product') && ( flexViewport.length != 0 ) ){

            var wcProductGalleryWrapper = $('.product').find('.woocommerce-product-gallery__wrapper');
            var onSaleBadge = wcProductGalleryWrapper.find('span.onsale');
            onSaleBadge.remove();
            flexViewport.append(onSaleBadge);
        }

    }

});