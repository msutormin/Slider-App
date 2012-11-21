/**
 * @author Daniel von Rhein
 * @date 09.12.2010
 * @version 0.2untested
 * @revision $Id$
 * @originator dvonrhein
 * @maintainer dvonrhein
 * @requires jQuery
 * 
 * Options:
 * node        = '.class' or '#id' for the main gallery-container
 * speedSlide  = sliding-speed in milliseconds
 * speedFade   = 'slow' (200ms), 'normal' (400ms), 'fast' (600ms)
 * loopSlides  = true/false (loop slides when beginning or end is reached)
 * easing      = swing/linear (constant linear slide-movement or default swinging)
 * showIndex   = true/false (update index-indicator if elements '.viewCurrents' and '.viewTotal' are present)
 */

(function() {
jExtGallery = function(options) {
    // configurable options
    this.node       = jQuery(options.node);
    this.speedSlide = options.hasOwnProperty('speedSlide') ? options.speedSlide : 400;
    this.speedFade  = options.hasOwnProperty('speedFade') ? options.speedFade : 'normal';
    this.loopSlides = options.loopSlides === true ? true : false;
    this.easing     = options.easing === 'linear' ? 'linear' : 'swing';
    this.showIndex  = options.showIndex === true ? true : false;

    // definition of some obj-vars
    this.viewPort        = jQuery('.viewPort', this.node);
    this.imgChangers     = jQuery('.imgNavi .showVisual', this.node);
    this.views           = jQuery('.view', this.node);
    this.leftNavigator   = jQuery('.mainNavi .left', this.node);
    this.rightNavigator  = jQuery('.mainNavi .right', this.node);
    this.totalViews      = this.views.length;
    this.viewWidth       = this.node.width();
    this.viewCounter     = 0;
    this.activeViewIndex = 0;
    this.textViewElement = jQuery('.mainNavi .infoAltText', this.node);
    return this;
};
jExtGallery.prototype = {
    init: function() {
        this.initEventHandlers();
        if (this.loopSlides) { this.initSlideLoop(); } // SlideLoop has to be initialized before ViewPort
        this.initViewPort();
        if (this.showIndex) { this.updateViewIndicator(); }
    },
    initEventHandlers: function() {
        var self = this;
        // bind fade-events
        this.imgChangers.each(function() {
            jQuery(this).click(function(e) {
                if (!jQuery(e.currentTarget).hasClass('active')) {
                    self.changeImage(e.target);
                }
            });
        });
        // bind slide-events for first usage
        this.leftNavigator.addClass('disabled');
        this.rightNavigator.addClass('disabled');
        if (this.loopSlides) {
            this.bindSlideEvents();
        } else {
            this.bindSlideEvents('right');
        }
    },
    bindSlideEvents: function(opt) {
        if (opt != 'right') {
            jQuery('.mainNavi .left', this.node).bind('click', jQuery.proxy(this.slideViewLeft, this));
            this.leftNavigator.removeClass('disabled');
        }
        if (opt != 'left') {
            jQuery('.mainNavi .right', this.node).bind('click', jQuery.proxy(this.slideViewRight, this));
            this.rightNavigator.removeClass('disabled');
        }
    },
    unbindSlideEvents: function(opt) {
        if (opt != 'right') {
            jQuery('.mainNavi .left', this.node).unbind('click');
            this.leftNavigator.addClass('disabled');
        }
        if (opt != 'left') {
            jQuery('.mainNavi .right', this.node).unbind('click');
            this.rightNavigator.addClass('disabled');
        }
    },
    initViewPort: function() {
        var slideViewWidth = this.totalViews * this.viewWidth;
        this.viewPort.css('width', slideViewWidth+'px');
        this.node.css('overflow', 'hidden');
    },
    initSlideLoop: function() {
        var firstView = jQuery(this.views.get(0)).clone(true);
        var lastView  = jQuery(this.views.get(this.totalViews-1)).clone(true);
        this.viewPort.append(firstView);
        this.viewPort.prepend(lastView);
        this.views       = jQuery('.view', this.node);
        this.totalViews  = this.views.length;
        this.viewPort.css('left', '-'+this.viewWidth+'px');
        this.activeViewIndex++;
    },
    slideViewLeft: function(viewChanger) {
        this.unbindSlideEvents();
        this.activeViewIndex--;
        this.checkImgNavi();
        this.viewPort.animate({'left': '+='+this.viewWidth+'px'}, this.speedSlide, this.easing, jQuery.proxy(this.afterSlideFunc, this));
    },
    slideViewRight: function(viewChanger) {
        this.unbindSlideEvents();
        this.activeViewIndex++;
        this.checkImgNavi();
        this.viewPort.animate({'left': '-='+this.viewWidth+'px'}, this.speedSlide, this.easing, jQuery.proxy(this.afterSlideFunc, this));
    },
    afterSlideFunc: function(e) {
        if (this.loopSlides) {
            this.bindSlideEvents();
            this.adjustSlidePosition();
        } else {
            if (this.activeViewIndex < this.totalViews-1) {
                this.bindSlideEvents('right');
            }
            if (this.activeViewIndex > 0) {
                this.bindSlideEvents('left');
            }
        }
        if (this.showIndex) { this.updateViewIndicator(); }
    },
    adjustSlidePosition: function() {
        if (this.activeViewIndex == this.totalViews-1) {
            var viewPortPos = this.viewWidth;
            this.viewPort.css('left', '-'+viewPortPos+'px');
            this.activeViewIndex = 1;
        } else if (this.activeViewIndex == 0) {
            var viewPortPos = this.viewWidth*this.totalViews - this.viewWidth*2;
            this.viewPort.css('left', '-'+viewPortPos+'px');
            this.activeViewIndex = this.totalViews-2;
        }
    },
    changeImage: function(imgChanger) {
        var self = this;
        var indexKey = jQuery(imgChanger).closest('.showVisual').prevAll().length;
        this.views.each(function() {
            var viewImgs = jQuery('img', this);
            if (viewImgs.length > 1) {
                var relImg = viewImgs.get(indexKey);
                var altText = jQuery(relImg).attr("alt");
                var referenceToCaptionElement = jQuery(relImg).attr("id");
                var getImageCaptionText = jQuery("#" + referenceToCaptionElement + "-caption").html();
                var imageCaptionText = altText;
                if(getImageCaptionText) {
                    imageCaptionText = getImageCaptionText;
                    if('object' === typeof(console)) {console.info("Found caption: ", getImageCaptionText)}
                }
                jQuery(relImg).fadeIn(180, jQuery.proxy(function(){
                    jQuery('.active', this).fadeOut(self.speedFade).removeClass('active');
                    jQuery(relImg).addClass('active');
                    jQuery(self.textViewElement).html(imageCaptionText);
                }, this));

            }
        });
        this.imgChangers.removeClass('active');
        jQuery(imgChanger).closest('.showVisual').addClass('active');
    },
    checkImgNavi: function() {
        var viewImgs = jQuery('img', this.views.get(this.activeViewIndex));
        if (viewImgs.length < 2) {
			jQuery('.textInfo', this.node).hide();
            jQuery('.imgNavi', this.node).hide();
			jQuery('.textInfo', this.node).show();
        } else {
			/*jQuery('.infoAltText', this.node).css("width", 100);*/
			jQuery('.textInfo', this.node).hide();
			jQuery('.infoAltText', this.node).hide();
			jQuery('.infoAltText', this.node).empty().css("width", 100);
			jQuery('.textInfo', this.node).css("width", 100);
            jQuery('.imgNavi', this.node).show();
			jQuery('.infoAltText', this.node).show();
			jQuery('.textInfo', this.node).show();
        }
    },
    updateViewIndicator: function() {
        updateAltText(this);
        if (this.loopSlides) {
            jQuery('.mainNavi .viewCurrent').text(this.activeViewIndex);
            jQuery('.mainNavi .viewTotal').text(this.totalViews-2);
        } else {
            jQuery('.mainNavi .viewCurrent').text(this.activeViewIndex+1);
            jQuery('.mainNavi .viewTotal').text(this.totalViews);
        }
    }
};
    function updateAltText(self){
        var realIndex = self.activeViewIndex + 1;
        var searchString = ('li:nth-child('+realIndex+') img.active');
        var getImageAltText = jQuery(searchString, self.node).attr('alt');
        var referenceToCaptionElement = jQuery(searchString, self.node).attr("id");
        var getImageCaptionText = jQuery("#" + referenceToCaptionElement + "-caption").html();
        var imageCaptionText = getImageAltText;
        if(getImageCaptionText) {
            imageCaptionText = getImageCaptionText;
            if('object' === typeof(console)) {console.info("Found caption: ", getImageCaptionText)}
        }
        if(self.node instanceof jQuery && self.node.length > 0)
        {
            $(self.node).find('.infoAltText').html(imageCaptionText).css('width',calculateWidth());
			$(self.node).find('.textInfo').css('width',calculateWidth());
        }
    }

    function calculateWidth(self){
		/* IE is, for any reason, calculating wrong (prop. rounding). Adjust the width for textInfo: */
		var textInfoPadding = $('.textInfo').outerWidth() - $('.textInfo').width() + 1, //40,
            mainNaviWidth = $('.mainNavi').width(), //825,
            imgNaviWidth,
            viewNaviWidth,
imgNaviVisible = $('.imgNavi').is(':visible');
            if ($('.imgNavi').length) imgNaviWidth = $('.imgNavi').outerWidth(); else imgNaviWidth = 0;
            if ($('.viewNavi').length) viewNaviWidth = $('.viewNavi').outerWidth(); else viewNaviWidth = 0;
 			if (!imgNaviVisible) imgNaviWidth = 0;
            /*  console.log('cal:');
            console.log('825 mainNaviWidth:' + mainNaviWidth);
            console.log('380+37 imgNaviWidth:' + imgNaviWidth);
            console.log('104 viewNaviWidth:' + viewNaviWidth);
            console.log('textInfoPadding:' + textInfoPadding);*/

        return  mainNaviWidth - imgNaviWidth - viewNaviWidth - textInfoPadding;
    }

})();

jQuery(document).ready(function () {
    window.jEG = new jExtGallery({
        node:       '#mainColorizer', // '.class' or '#id' for the main gallery-container
        speedSlide: 400,              // sliding-speed in milliseconds
        speedFade:  'fast',           // 'slow' (200ms), 'normal' (400ms), 'fast' (600ms)
        loopSlides: true,             // loop slides when beginning or end is reached
        showIndex:  true              // update index-indicator if elements '.viewCurrents' and '.viewTotal' are present
    });
    jEG.init();
});
