/// <reference path="../../submodule/DefinitelyTyped/knockout/knockout.d.ts" />

function AppViewModel() {
    this.splitUrl = ko.observable("");
    this.playbackUrl = ko.observable("");
    this.sUrl = ko.computed(function() {
        return "/gif/frame/" + this.splitUrl();
    }, this);
    this.pUrl = ko.computed(function() {
        return "/gif/playback/" + this.playbackUrl();
    }, this);
}

// Activates knockout.js
ko.applyBindings(new AppViewModel());
