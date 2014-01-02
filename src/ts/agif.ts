/// <reference path="../../submodule/DefinitelyTyped/knockout/knockout.d.ts" />

(function() {
    function AppViewModel() {
        this.url = ko.observable();
        this.split = ko.observable();
        this.frame = ko.observable();
        this.reverse = ko.observable();
        this.playback = ko.observable();
        this.showBlocks = ko.observable(false);
        this.splitUrl = ko.computed(function() {
            if (!this.url()) {
                return "";
            }
            this.split("split by JavaScript<br><span>HTML</span>");
            this.showBlocks(true);
            return "/page/split/" + this.url();
        }, this);
        this.frameUrl = ko.computed(function() {
            if (!this.url()) {
                return "";
            }
            this.frame("split by ImageMagick<br><span>HTML</span>");
            this.showBlocks(true);
            return "/page/frame/" + this.url();
        }, this);
        this.reverseUrl = ko.computed(function() {
            if (!this.url()) {
                return "";
            }
            this.reverse("reverse by JavaScript<br><span>HTML</span>");
            this.showBlocks(true);
            return "/page/reverse/" + this.url();
        }, this);
        this.playbackUrl = ko.computed(function() {
            if (!this.url()) {
                return "";
            }
            this.playback("playback by ImageMagick<br><span>GIF</span>");
            this.showBlocks(true);
            return "/gif/playback/" + this.url();
        }, this);
        this.disableEnter = function(formElement) {
            return false;
        };
    }

    ko.applyBindings(new AppViewModel());
})();