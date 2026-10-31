/*!
 * Festoria – Event Decoration & Styling Services HTML Template
 * main.js: preloader, header menus, scroll reveal, hero, garland builder, service slides, client stories,
 * service showcase, price estimator, counters, FAQ, tabs, gallery lightbox, quantity buttons.
 * Plain JavaScript, no dependencies, loaded at the end of <body>.
 * Events use delegation: one listener per component (see on()), not one per button.
 * No inline styles: moving values are CSS custom properties kept in one script-owned stylesheet (see live()).
 */
( function () {
    'use strict';

    var reduceMotion = window.matchMedia && window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;

    function ready( fn ) {
        if ( document.readyState !== 'loading' ) { fn(); } else { document.addEventListener( 'DOMContentLoaded', fn ); }
    }
    function each( selector, fn, scope ) {
        Array.prototype.forEach.call( ( scope || document ).querySelectorAll( selector ), fn );
    }
    function indexOf( list, el ) {
        return Array.prototype.indexOf.call( list, el );
    }

    /* ------------------------------------------------------------------
     * Delegated events: on( container, 'click', '.item', handler ) runs handler( event, item ) for clicks on any
     * .item inside container, including items added later. One listener per container instead of one per item.
     * ------------------------------------------------------------------ */
    function on( root, type, selector, handler, capture ) {
        root.addEventListener( type, function ( e ) {
            var target = e.target.closest ? e.target.closest( selector ) : null;
            if ( target && root.contains( target ) ) { handler( e, target ); }
        }, !! capture );
    }

    /* ------------------------------------------------------------------
     * Live CSS rules: returns the style object of a rule in a stylesheet owned by this script,
     * e.g. live( '.hero' ).setProperty( '--hero-mx', '0.2' ). Older browsers simply skip the effect.
     * ------------------------------------------------------------------ */
    var sheet = null;
    function live( selector ) {
        try {
            if ( ! sheet ) {
                sheet = new CSSStyleSheet();
                document.adoptedStyleSheets = Array.prototype.concat.call( [], Array.prototype.slice.call( document.adoptedStyleSheets ), [ sheet ] );
            }
            return sheet.cssRules[ sheet.insertRule( selector + ' {}', sheet.cssRules.length ) ].style;
        } catch ( e ) {
            return { setProperty: function () {} };
        }
    }

    /* ------------------------------------------------------------------
     * 1. Preloader: balloons rise, then float away once the page has loaded
     * ------------------------------------------------------------------ */
    function preloader() {
        var el = document.querySelector( '.preloader' );
        if ( ! el ) { return; }
        function hide() {
            if ( el.classList.contains( 'is-leaving' ) ) { return; }
            el.classList.add( 'is-leaving' );
            setTimeout( function () { el.classList.add( 'is-done' ); }, 350 );
            setTimeout( function () { el.hidden = true; }, 1100 );
        }
        if ( document.readyState === 'complete' ) { setTimeout( hide, 350 ); } else { window.addEventListener( 'load', function () { setTimeout( hide, 350 ); } ); }
        setTimeout( hide, 4000 );                                       // never keep visitors waiting on a slow asset
        window.addEventListener( 'pageshow', function ( e ) { if ( e.persisted ) { el.hidden = true; } } );
    }

    /* ------------------------------------------------------------------
     * 2. Header: search panel, mobile menu, mobile sub menus (one delegated listener)
     * ------------------------------------------------------------------ */
    function header() {
        var search = document.getElementById( 'search-panel' );
        var openSearch = document.querySelector( '.js-search-open' );
        var menu = document.getElementById( 'mobile-menu' );
        var openMenu = document.querySelector( '.js-menu-open' );

        function setSearch( open ) {
            if ( ! search ) { return; }
            search.hidden = ! open;
            if ( openSearch ) { openSearch.setAttribute( 'aria-expanded', open ? 'true' : 'false' ); }
            if ( open ) { var input = search.querySelector( 'input' ); if ( input ) { input.focus(); } }
        }
        function setMenu( open ) {
            if ( ! menu ) { return; }
            menu.hidden = ! open;
            document.body.classList.toggle( 'is-menu-open', open );
            if ( openMenu ) { openMenu.setAttribute( 'aria-expanded', open ? 'true' : 'false' ); }
            if ( open ) { var first = menu.querySelector( '.js-menu-close.icon-btn' ); if ( first ) { first.focus(); } }
            else if ( openMenu ) { openMenu.focus(); }
        }
        var siteHeader = document.querySelector( '.site-header' );
        if ( ! siteHeader ) { return; }
        on( siteHeader, 'click', '.js-search-open', function () { setSearch( search.hidden ); } );
        on( siteHeader, 'click', '.js-search-close', function () { setSearch( false ); } );
        on( siteHeader, 'click', '.js-menu-open', function () { setMenu( true ); } );
        on( siteHeader, 'click', '.js-menu-close', function () { setMenu( false ); } );
        on( siteHeader, 'click', '.mobile-nav__toggle', function ( e, toggle ) {
            var sub = toggle.closest( '.mobile-nav__item' ).querySelector( '.mobile-nav__sub' );
            var open = toggle.getAttribute( 'aria-expanded' ) !== 'true';
            toggle.setAttribute( 'aria-expanded', open ? 'true' : 'false' );
            if ( sub ) { sub.hidden = ! open; }
        } );
        document.addEventListener( 'keydown', function ( e ) {
            if ( e.key !== 'Escape' ) { return; }
            if ( search && ! search.hidden ) { setSearch( false ); }
            if ( menu && ! menu.hidden ) { setMenu( false ); }
        } );
    }

    /* ------------------------------------------------------------------
     * 3. Reveal on scroll: the studio block (.reveal -> .in-view) and cards (.is-visible)
     * ------------------------------------------------------------------ */
    function reveal() {
        var studio = document.querySelectorAll( '.studio .reveal, .studio .reveal-badge' );
        var cards = document.querySelectorAll( '.work-grid__item, .team-grid__item, .service-grid__item, .post-card, .steps__card, .help-card' );
        if ( reduceMotion || ! ( 'IntersectionObserver' in window ) ) {
            each( '.studio .reveal, .studio .reveal-badge', function ( el ) { el.classList.add( 'in-view' ); } );
            return;
        }
        var io = new IntersectionObserver( function ( entries ) {
            entries.forEach( function ( entry ) {
                if ( ! entry.isIntersecting ) { return; }
                entry.target.classList.add( entry.target.classList.contains( 'reveal-card' ) ? 'is-visible' : 'in-view' );
                io.unobserve( entry.target );
            } );
        }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' } );
        Array.prototype.forEach.call( studio, function ( el ) { io.observe( el ); } );
        Array.prototype.forEach.call( cards, function ( el ) { el.classList.add( 'reveal', 'reveal-card' ); io.observe( el ); } );
    }

    /* ------------------------------------------------------------------
     * 4. Hero: pointer parallax on the photo stack, tap-to-open hotspot, soft video loop
     * ------------------------------------------------------------------ */
    function hero( root ) {
        var rule = live( '.hero' );
        if ( ! reduceMotion && window.matchMedia( '(hover: hover)' ).matches ) {
            root.addEventListener( 'pointermove', function ( e ) {
                var r = root.getBoundingClientRect();
                rule.setProperty( '--hero-mx', ( ( e.clientX - r.left ) / r.width - 0.5 ).toFixed( 3 ) );
                rule.setProperty( '--hero-my', ( ( e.clientY - r.top ) / r.height - 0.5 ).toFixed( 3 ) );
            } );
            root.addEventListener( 'pointerleave', function () { rule.setProperty( '--hero-mx', '0' ); rule.setProperty( '--hero-my', '0' ); } );
        }
        var video = root.querySelector( '.hero__video' );
        if ( video ) {
            if ( reduceMotion ) { video.pause(); }
            video.addEventListener( 'timeupdate', function () {
                if ( video.duration && video.currentTime > video.duration - 0.7 ) { video.classList.add( 'is-fading' ); }
                else if ( video.currentTime > 0.4 ) { video.classList.remove( 'is-fading' ); }
            } );
            var p = video.play && video.play(); if ( p && p.catch ) { p.catch( function () {} ); }
        }
        on( root, 'click', '.hero__hotspot', function ( e, hotspot ) { hotspot.classList.toggle( 'is-open' ); } );
        on( root, 'keydown', '.hero__hotspot', function ( e, hotspot ) {
            if ( e.key === 'Enter' || e.key === ' ' ) { e.preventDefault(); hotspot.classList.toggle( 'is-open' ); }
        } );
    }

    /* ------------------------------------------------------------------
     * 5. Garland builder: length, colour story and finishes update the preview, summary and request link
     * ------------------------------------------------------------------ */
    function garland( root ) {
        var cur = root.getAttribute( 'data-currency' ) || '$';
        var none = root.getAttribute( 'data-none' ) || '';
        var stage = root.querySelector( '.garland__stage' );
        var shape = root.querySelector( '.garland__garland' );
        var rulerVal = root.querySelector( '.garland__ruler-val' );
        var lengths = root.querySelectorAll( '.garland__length' );
        var stories = root.querySelectorAll( '.garland__story' );
        var finishes = root.querySelectorAll( '.garland__finish input' );
        var btn = root.querySelector( '.garland__btn' );
        var out = {
            length: root.querySelector( '.garland__sum-length' ), colors: root.querySelector( '.garland__sum-colors' ),
            finish: root.querySelector( '.garland__sum-finish' ), total: root.querySelector( '.garland__sum-total' )
        };
        function active( list ) {
            for ( var i = 0; i < list.length; i++ ) { if ( list[ i ].classList.contains( 'is-active' ) ) { return list[ i ]; } }
            return list[ 0 ];
        }
        function update() {
            var len = active( lengths ), story = active( stories );
            var total = parseFloat( len.getAttribute( 'data-price' ) ) || 0;
            var names = [], effects = {};
            Array.prototype.forEach.call( finishes, function ( f ) {
                if ( f.checked ) {
                    total += parseFloat( f.getAttribute( 'data-price' ) ) || 0;
                    names.push( f.value );
                    effects[ f.getAttribute( 'data-effect' ) ] = true;
                }
            } );
            [ 'small', 'medium', 'large' ].forEach( function ( s ) { shape.classList.remove( 'garland__shape--' + s ); } );
            shape.classList.add( 'garland__shape--' + len.getAttribute( 'data-preview' ) );
            [ 'chrome', 'greenery', 'neon' ].forEach( function ( e ) { stage.classList.toggle( 'has-' + e, !! effects[ e ] ); } );
            if ( rulerVal ) { rulerVal.textContent = len.getAttribute( 'data-size' ); }
            out.length.textContent = len.getAttribute( 'data-name' ) + ', ' + len.getAttribute( 'data-size' );
            out.colors.textContent = story ? story.getAttribute( 'data-name' ) : '';
            out.finish.textContent = names.length ? names.join( ', ' ) : none;
            out.total.textContent = cur + Math.round( total ).toLocaleString( 'en-US' );
            if ( btn ) {
                var base = btn.getAttribute( 'data-base' ) || btn.getAttribute( 'href' );
                btn.setAttribute( 'href', base + ( base.indexOf( '?' ) > -1 ? '&' : '?' ) + 'garland_length=' + encodeURIComponent( len.getAttribute( 'data-size' ) ) +
                    '&garland_colours=' + encodeURIComponent( story ? story.getAttribute( 'data-name' ) : '' ) + '&garland_finish=' + encodeURIComponent( names.join( ', ' ) ) );
            }
        }
        function showStory( el, i ) {
            Array.prototype.forEach.call( stories, function ( o ) { stage.classList.remove( o.getAttribute( 'data-story' ) ); } );
            stage.classList.add( el.getAttribute( 'data-story' ) );
            for ( var k = 0; k < stories.length; k++ ) { stage.classList.remove( 'shows-story-' + k ); }
            stage.classList.add( 'shows-story-' + ( el.getAttribute( 'data-index' ) || i ) );
        }
        // radio groups: select an option, update the preview
        function select( list, el ) {
            Array.prototype.forEach.call( list, function ( o ) { o.classList.remove( 'is-active' ); o.setAttribute( 'aria-checked', 'false' ); o.tabIndex = -1; } );
            el.classList.add( 'is-active' ); el.setAttribute( 'aria-checked', 'true' ); el.tabIndex = 0;
            if ( list === stories ) { showStory( el, indexOf( stories, el ) ); }
            update();
        }
        function group( selector, list ) {
            on( root, 'click', selector, function ( e, el ) { select( list, el ); } );
            // arrow keys move between options, like native radio buttons
            on( root, 'keydown', selector, function ( e, el ) {
                var d = ( e.key === 'ArrowRight' || e.key === 'ArrowDown' ) ? 1 : ( e.key === 'ArrowLeft' || e.key === 'ArrowUp' ) ? -1 : 0;
                if ( ! d ) { return; }
                e.preventDefault();
                var next = list[ ( indexOf( list, el ) + d + list.length ) % list.length ];
                select( list, next );
                next.focus();
            } );
            Array.prototype.forEach.call( list, function ( el ) { el.tabIndex = el.classList.contains( 'is-active' ) ? 0 : -1; } );
        }
        group( '.garland__length', lengths );
        group( '.garland__story', stories );
        on( root, 'change', '.garland__finish input', update );
        update();
        // transitions only after the first paint, so the preview never animates into place on load
        window.requestAnimationFrame( function () { window.requestAnimationFrame( function () { root.classList.add( 'is-ready' ); } ); } );
    }

    /* ------------------------------------------------------------------
     * 6. Service slides: sticky slides that cross-fade while scrolling (values in CSS custom properties)
     * ------------------------------------------------------------------ */
    function slides( el ) {
        var sections = el.querySelectorAll( '.slides__section' );
        var n = sections.length;
        if ( ! n || reduceMotion ) { return; }
        var intensity = parseFloat( el.getAttribute( 'data-intensity' ) ) || 80;
        var FADE = 0.22;
        var rules = Array.prototype.map.call( sections, function ( s, i ) { return live( '.slides__section:nth-child(' + ( i + 1 ) + ')' ); } );
        el.classList.add( 'is-live' );
        var ticking = false;
        function clamp( v, lo, hi ) { return Math.min( hi, Math.max( lo, v ) ); }
        function update() {
            ticking = false;
            var top = el.getBoundingClientRect().top + window.pageYOffset;
            var scrollable = el.scrollHeight - window.innerHeight;
            if ( scrollable <= 0 ) { return; }
            var progress = clamp( ( window.pageYOffset - top ) / scrollable, 0, 1 );
            var amp = ( el.classList.contains( 'is-split' ) && window.innerWidth <= 1024 ) ? 0 : intensity;
            for ( var i = 0; i < n; i++ ) {
                var p = clamp( ( progress - i / n ) * n, 0, 1 );
                rules[ i ].setProperty( '--slide-o', ( i > 0 && p < FADE ) ? ( p / FADE ).toFixed( 3 ) : '1' );
                rules[ i ].setProperty( '--slide-scale', ( 1.08 - 0.08 * p ).toFixed( 4 ) );
                rules[ i ].setProperty( '--slide-y', ( amp - 2 * amp * p ).toFixed( 2 ) + 'px' );
                rules[ i ].setProperty( '--slide-p', p.toFixed( 4 ) );
            }
        }
        window.addEventListener( 'scroll', function () { if ( ! ticking ) { ticking = true; window.requestAnimationFrame( update ); } }, { passive: true } );
        window.addEventListener( 'resize', update );
        update();
    }

    /* ------------------------------------------------------------------
     * 7. Client stories: featured slider with arrows, dots and an autoplay that pauses on hover / focus
     * ------------------------------------------------------------------ */
    function stories( root ) {
        var box = root.querySelector( '.stories__featured' );
        if ( ! box ) { return; }
        var slidesEls = box.querySelectorAll( '.stories__slide' );
        var dots = box.querySelectorAll( '.stories__dot' );
        if ( slidesEls.length < 2 ) { return; }
        var current = 0, timer = null, paused = false;
        var seconds = parseInt( root.getAttribute( 'data-autoplay' ), 10 ) || 0;
        function go( i ) {
            current = ( i + slidesEls.length ) % slidesEls.length;
            Array.prototype.forEach.call( slidesEls, function ( s, k ) {
                s.classList.toggle( 'is-active', k === current );
                if ( k === current ) { s.removeAttribute( 'aria-hidden' ); } else { s.setAttribute( 'aria-hidden', 'true' ); }
            } );
            Array.prototype.forEach.call( dots, function ( d, k ) {
                d.classList.toggle( 'is-active', k === current );
                d.setAttribute( 'aria-current', k === current ? 'true' : 'false' );
            } );
        }
        function stop() { if ( timer ) { window.clearInterval( timer ); timer = null; } }
        function start() {
            stop();
            if ( seconds > 0 && ! reduceMotion ) { timer = window.setInterval( function () { if ( ! paused && ! document.hidden ) { go( current + 1 ); } }, seconds * 1000 ); }
        }
        on( box, 'click', '[data-cs-prev]', function () { go( current - 1 ); start(); } );
        on( box, 'click', '[data-cs-next]', function () { go( current + 1 ); start(); } );
        on( box, 'click', '.stories__dot', function ( e, d ) { go( parseInt( d.getAttribute( 'data-cs-go' ), 10 ) ); start(); } );
        [ 'mouseenter', 'focusin' ].forEach( function ( ev ) { box.addEventListener( ev, function () { paused = true; } ); } );
        [ 'mouseleave', 'focusout' ].forEach( function ( ev ) { box.addEventListener( ev, function () { paused = false; } ); } );
        start();
    }

    /* ------------------------------------------------------------------
     * 8. Service showcase: hover / focus / click a service to show its photo (accordion on tablets and phones)
     * ------------------------------------------------------------------ */
    function showcase( root ) {
        var items = root.querySelectorAll( '.showcase__item' );
        var panels = root.querySelectorAll( '.showcase__panel' );
        var desktop = window.matchMedia( '(min-width: 1025px)' );
        function activate( item ) {
            var i = indexOf( items, item );
            if ( i < 0 || item.classList.contains( 'is-active' ) ) { return; }
            Array.prototype.forEach.call( items, function ( it, k ) {
                it.classList.toggle( 'is-active', k === i );
                var b = it.querySelector( '.showcase__row' );
                if ( b ) { b.setAttribute( 'aria-expanded', k === i ? 'true' : 'false' ); }
            } );
            Array.prototype.forEach.call( panels, function ( p, k ) { p.classList.toggle( 'is-active', k === i ); } );
        }
        on( root, 'mouseover', '.showcase__item', function ( e, item ) { if ( desktop.matches ) { activate( item ); } } );
        on( root, 'focusin', '.showcase__row', function ( e, row ) { if ( desktop.matches ) { activate( row.closest( '.showcase__item' ) ); } } );
        on( root, 'click', '.showcase__row', function ( e, row ) { activate( row.closest( '.showcase__item' ) ); } );
    }

    /* ------------------------------------------------------------------
     * 9. Price estimator: décor style, length, bouquets and extras
     * ------------------------------------------------------------------ */
    function calculator( wrap ) {
        var config = {};
        try { config = JSON.parse( wrap.getAttribute( 'data-config' ) || '{}' ); } catch ( e ) {}
        var currency = config.currency || '$', extraCost = config.bed_cost || 0;
        var state = { base: 0, rate: 0, size: 0, extra: 0, addons: 0 };
        var total = wrap.querySelector( '.calc-result__price' );
        var styles = wrap.querySelectorAll( '.calc-seg__item' );
        var addons = wrap.querySelectorAll( '.calc-addon' );
        var sizeInput = wrap.querySelector( '.calc-size-range' ), sizeOut = wrap.querySelector( '.calc-size-out' );
        var extraInput = wrap.querySelector( '.calc-beds-range' ), extraOut = wrap.querySelector( '.calc-beds-out' );
        function recalc() {
            var sum = state.base + state.size * state.rate + state.extra * extraCost + state.addons;
            if ( total ) { total.textContent = currency + Math.round( sum ).toLocaleString( 'en-US' ); }
        }
        on( wrap, 'click', '.calc-seg__item', function ( e, item ) {
            Array.prototype.forEach.call( styles, function ( o ) { var sel = o === item; o.classList.toggle( 'on', sel ); o.setAttribute( 'aria-pressed', sel ? 'true' : 'false' ); } );
            state.base = parseFloat( item.dataset.base ) || 0;
            state.rate = parseFloat( item.dataset.rate ) || 0;
            recalc();
        } );
        on( wrap, 'click', '.calc-addon', function ( e, a ) {
            var now = ! a.classList.contains( 'on' );
            a.classList.toggle( 'on', now );
            a.setAttribute( 'aria-pressed', now ? 'true' : 'false' );
            state.addons = 0;
            Array.prototype.forEach.call( addons, function ( x ) { if ( x.classList.contains( 'on' ) ) { state.addons += parseFloat( x.dataset.cost ) || 0; } } );
            recalc();
        } );
        on( wrap, 'input', '.calc-size-range', function () {
            state.size = parseFloat( sizeInput.value ) || 0;
            if ( sizeOut ) { sizeOut.textContent = sizeInput.value + ' ' + ( sizeInput.dataset.unit || '' ); }
            sizeInput.setAttribute( 'aria-valuetext', sizeInput.value + ' ' + ( sizeInput.dataset.unit || '' ) );
            recalc();
        } );
        on( wrap, 'input', '.calc-beds-range', function () {
            state.extra = parseFloat( extraInput.value ) || 0;
            if ( extraOut ) { extraOut.textContent = extraInput.value === '0' ? ( extraInput.dataset.studioLabel || 'None' ) : extraInput.value; }
            recalc();
        } );
        var selected = wrap.querySelector( '.calc-seg__item.on' ) || styles[ 0 ];
        if ( selected ) { state.base = parseFloat( selected.dataset.base ) || 0; state.rate = parseFloat( selected.dataset.rate ) || 0; }
        if ( sizeInput ) { state.size = parseFloat( sizeInput.value ) || 0; }
        if ( extraInput ) { state.extra = parseFloat( extraInput.value ) || 0; }
        recalc();
    }

    /* ------------------------------------------------------------------
     * 10. Counters: count up once when they scroll into view
     * ------------------------------------------------------------------ */
    function counters() {
        var els = document.querySelectorAll( '.js-count' );
        if ( ! els.length || reduceMotion || ! ( 'IntersectionObserver' in window ) ) { return; }
        var io = new IntersectionObserver( function ( entries ) {
            entries.forEach( function ( entry ) {
                if ( ! entry.isIntersecting ) { return; }
                io.unobserve( entry.target );
                var el = entry.target, to = parseFloat( el.getAttribute( 'data-to' ) ) || 0, t0 = null;
                function frame( t ) {
                    if ( ! t0 ) { t0 = t; }
                    var k = Math.min( 1, ( t - t0 ) / 1600 );
                    el.textContent = Math.round( to * ( 1 - Math.pow( 1 - k, 3 ) ) ).toLocaleString( 'en-US' );
                    if ( k < 1 ) { window.requestAnimationFrame( frame ); }
                }
                el.textContent = '0';
                window.requestAnimationFrame( frame );
            } );
        }, { threshold: 0.6 } );
        Array.prototype.forEach.call( els, function ( el ) { io.observe( el ); } );
    }

    /* ------------------------------------------------------------------
     * 11. FAQ: one answer open at a time per column (FAQ page and single service)
     * ------------------------------------------------------------------ */
    function faq( col ) {
        // "toggle" does not bubble, so the column listens in the capture phase
        on( col, 'toggle', '.faq__item', function ( e, item ) {
            if ( e.target !== item || ! item.open ) { return; }
            each( '.faq__item', function ( o ) { if ( o !== item ) { o.open = false; } }, col );
        }, true );
    }
    function serviceFaq( list ) {
        each( '.service-faq-question', function ( q ) {
            q.setAttribute( 'aria-expanded', q.closest( '.service-faq-item' ).classList.contains( 'is-open' ) ? 'true' : 'false' );
        }, list );
        on( list, 'click', '.service-faq-question', function ( e, q ) {
            var item = q.closest( '.service-faq-item' );
            var open = ! item.classList.contains( 'is-open' );
            each( '.service-faq-item', function ( o ) { o.classList.remove( 'is-open' ); o.querySelector( '.service-faq-question' ).setAttribute( 'aria-expanded', 'false' ); }, list );
            item.classList.toggle( 'is-open', open );
            q.setAttribute( 'aria-expanded', open ? 'true' : 'false' );
        } );
    }

    /* ------------------------------------------------------------------
     * 12. Tabs (product page) and quantity buttons
     * ------------------------------------------------------------------ */
    function tabs( root ) {
        var list = root.querySelectorAll( '[role="tab"]' );
        function show( tab ) {
            Array.prototype.forEach.call( list, function ( t ) {
                var sel = t === tab;
                t.setAttribute( 'aria-selected', sel ? 'true' : 'false' );
                t.tabIndex = sel ? 0 : -1;
                document.getElementById( t.getAttribute( 'aria-controls' ) ).hidden = ! sel;
            } );
        }
        on( root, 'click', '[role="tab"]', function ( e, t ) { show( t ); } );
        on( root, 'keydown', '[role="tab"]', function ( e, t ) {
            var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
            if ( ! d ) { return; }
            var next = list[ ( indexOf( list, t ) + d + list.length ) % list.length ];
            show( next ); next.focus();
        } );
    }
    function quantity() {
        on( document, 'click', '.js-qty', function ( e, btn ) {
            var input = btn.parentNode.querySelector( 'input' );
            var v = ( parseInt( input.value, 10 ) || 1 ) + parseInt( btn.dataset.step, 10 );
            input.value = Math.max( parseInt( input.min, 10 ) || 1, v );
        } );
    }

    /* ------------------------------------------------------------------
     * 13. Gallery lightbox (single event gallery and product photo)
     * ------------------------------------------------------------------ */
    function lightbox() {
        var triggers = document.querySelectorAll( '.lightbox-trigger, .js-lightbox' );
        if ( ! triggers.length ) { return; }
        var box = document.createElement( 'div' );
        box.className = 'lightbox-overlay';
        box.setAttribute( 'role', 'dialog' );
        box.setAttribute( 'aria-modal', 'true' );
        box.setAttribute( 'aria-label', 'Photo viewer' );
        box.hidden = true;
        box.innerHTML = '<div class="lightbox-content"></div>' +
            '<button type="button" class="lightbox-close" aria-label="Close">&times;</button>' +
            ( triggers.length > 1 ? '<button type="button" class="lightbox-prev" aria-label="Previous photo">&#8249;</button><button type="button" class="lightbox-next" aria-label="Next photo">&#8250;</button>' : '' );
        document.body.appendChild( box );
        var img = document.createElement( 'img' ), current = 0, opener = null;      // added on first open, so no empty <img> sits in the page
        img.className = 'lightbox-img';
        function show( i ) {
            current = ( i + triggers.length ) % triggers.length;
            img.src = triggers[ current ].getAttribute( 'href' );
            var thumb = triggers[ current ].querySelector( 'img' );
            img.alt = thumb ? thumb.alt : '';
        }
        function open( i, from ) { opener = from; if ( ! img.parentNode ) { box.querySelector( '.lightbox-content' ).appendChild( img ); } show( i ); box.hidden = false; box.classList.add( 'active' ); document.body.classList.add( 'is-menu-open' ); box.querySelector( '.lightbox-close' ).focus(); }
        function close() { box.hidden = true; box.classList.remove( 'active' ); document.body.classList.remove( 'is-menu-open' ); img.removeAttribute( 'src' ); if ( opener ) { opener.focus(); } }
        on( document, 'click', '.lightbox-trigger, .js-lightbox', function ( e, t ) { e.preventDefault(); open( indexOf( triggers, t ), t ); } );
        on( box, 'click', '.lightbox-close', close );
        on( box, 'click', '.lightbox-prev', function () { show( current - 1 ); } );
        on( box, 'click', '.lightbox-next', function () { show( current + 1 ); } );
        box.addEventListener( 'click', function ( e ) { if ( e.target === box || e.target.classList.contains( 'lightbox-content' ) ) { close(); } } );
        document.addEventListener( 'keydown', function ( e ) {
            if ( box.hidden ) { return; }
            if ( e.key === 'Escape' ) { close(); }
            if ( e.key === 'ArrowLeft' ) { show( current - 1 ); }
            if ( e.key === 'ArrowRight' ) { show( current + 1 ); }
        } );
    }

    /* ------------------------------------------------------------------
     * 14. Film (video feature): pop-up player, the video loads only on click.
     *     Set data-src on .film__modal (YouTube / Vimeo embed URL or an .mp4 with data-type="mp4") and remove "disabled".
     * ------------------------------------------------------------------ */
    function film( root ) {
        var modal = root.querySelector( '.film__modal' );
        if ( ! modal || ! modal.getAttribute( 'data-src' ) ) { return; }
        var frame = modal.querySelector( '.film__frame' ), opener = null;
        function close() {
            while ( frame.firstChild ) { frame.removeChild( frame.firstChild ); }
            if ( modal.open ) { modal.close(); }
            if ( opener ) { opener.focus(); }
        }
        each( '[data-film-open]', function ( btn ) { btn.disabled = false; }, root );
        on( root, 'click', '[data-film-open]', function ( e, btn ) {
            var src = modal.getAttribute( 'data-src' ), el;
            if ( modal.getAttribute( 'data-type' ) === 'mp4' ) {
                el = document.createElement( 'video' ); el.src = src; el.controls = true; el.autoplay = true; el.playsInline = true;
            } else {
                el = document.createElement( 'iframe' ); el.src = src; el.title = modal.getAttribute( 'aria-label' ) || 'Video';
                el.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'; el.allowFullscreen = true;
            }
            frame.appendChild( el );
            opener = btn;
            modal.showModal();
        } );
        on( modal, 'click', '.film__close', close );
        modal.addEventListener( 'click', function ( e ) { if ( e.target === modal ) { close(); } } );
        modal.addEventListener( 'cancel', function ( e ) { e.preventDefault(); close(); } );
        root.classList.remove( 'is-empty' );
    }

    preloader();
    ready( function () {
        header();
        reveal();
        each( '.hero', hero );
        each( '.garland', garland );
        each( '.slides', slides );
        each( '.stories', stories );
        each( '.showcase', showcase );
        each( '.calc-inner', calculator );
        each( '.film', film );
        each( '.faq__col', faq );
        each( '.service-faq-list', serviceFaq );
        each( '.js-tabs', tabs );
        quantity();
        counters();
        lightbox();
    } );
} )();
