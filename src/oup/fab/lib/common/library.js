/*!
 * ${copyright}
 */

/**
 * Initialization Code and shared classes of library oup.fab.lib.common.
 */
sap.ui.define(
  ["sap/ui/core/library"],
  function () {
    "use strict";

    /**
     * OUP common components library
     *
     * @namespace
     * @name oup.fab.lib.common
     * @author SAP SE
     * @version 1.0.0
     * @public
     */

    // delegate further initialization of this library to the Core
    // Hint: sap.ui.getCore() must still be used to support preload with sync bootstrap!
    sap.ui.getCore().initLibrary({
      name: "oup.fab.lib.common",
      version: "${version}",
      dependencies: [
        // keep in sync with the ui5.yaml and .library files
        "sap.ui.core",
      ],
      types: [],
      interfaces: [],
      controls: ["oup.fab.lib.common.controls.CreateEmail"],
      elements: [],
      noLibraryCSS: true, // if no CSS is provided, you can disable the library.css load here
    });

    /* eslint-disable */
    return oup.fab.lib.common;
    /* eslint-enable */
  },
  /* bExport= */ false
);
