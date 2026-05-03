sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";

    return Controller.extend("zbom.controller.View1", {
        onContinue: function () {
            var sMat = this.byId("inpMaterial3").getValue();
            var sPlant = this.byId("inpPlant3").getValue();

            if (!sMat || !sPlant) {
                MessageToast.show("Please fill required fields.");
                return;
            }

            this.getOwnerComponent().getRouter().navTo("RouteBOMItem");
        },

        onMaterialValueHelp: function () {
            MessageToast.show("Value Help Requested");
        }
    });
});