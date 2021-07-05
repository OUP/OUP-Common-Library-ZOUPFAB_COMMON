sap.ui.define(
  ["oup/fab/lib/common/library", "oup/fab/lib/common/CreateEmail"],
  function (library, CreateEmail) {
    "use strict";

    // refer to library types
    // var ExampleColor = library.ExampleColor;

    // create a new instance of the Example control and
    // place it into the DOM element with the id "content"
    new CreateEmail({
      appID: "PRR",
    }).placeAt("content");
  }
);
