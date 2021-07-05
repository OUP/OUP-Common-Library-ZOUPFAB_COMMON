sap.ui.define(
  ["sap/ui/base/Object", "sap/ui/Device", "sap/m/MessageBox"],
  function (UI5Object, Device, MessageBox) {
    "use strict";

    var Formatter = UI5Object.extend("oup.fab.lib.common.util.Formatter", {});

    Formatter.getDensity = function (sTitle) {
      if (this._sContentDensityClass === undefined) {
        // check whether FLP has already set the content density class; do nothing in this case
        if (
          jQuery(document.body).hasClass("sapUiSizeCozy") ||
          jQuery(document.body).hasClass("sapUiSizeCompact")
        ) {
          this._sContentDensityClass = "";
        } else if (!Device.support.touch) {
          // apply "compact" mode if touch is not supported
          this._sContentDensityClass = "sapUiSizeCompact";
        } else {
          // "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
          this._sContentDensityClass = "sapUiSizeCozy";
        }
      }
      return this._sContentDensityClass;
    };

    return Formatter;
  }
);
