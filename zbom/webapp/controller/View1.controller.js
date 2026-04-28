sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend("zbom.controller.View1", {

        onCreate: function () {
            this.getOwnerComponent().getRouter().navTo("RouteBOMCreate");
        },

        onSelect: function (oEvent) {
            var oCtx = oEvent.getSource().getBindingContext();
            var sBomId = oCtx.getProperty("BomId");

            this.getOwnerComponent().getRouter().navTo("RouteBOMItem", {
                BomId: sBomId
            });
        }

    });
});