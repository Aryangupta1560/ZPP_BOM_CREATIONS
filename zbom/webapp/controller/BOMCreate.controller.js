sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
], function (Controller, MessageToast) {
    "use strict";

    return Controller.extend("zbom.controller.BOMCreate", {

        onCreateBOM: function () {
            var oModel = this.getView().getModel();

            var oData = {
                Plant: this.byId().getValue(),
                Material: this.byId().getValue(),
                BomUsage: this.byId().getValue()
            };

            oModel.create("/ZC_BOM_HEADER", oData, {
                success: function (oResponse) {
                    MessageToast.show("BOM Created");

                    this.getOwnerComponent().getRouter().navTo("RouteBOMItem", {
                        BomId: oResponse.BomId
                    });
                }.bind(this)
            });
        }

    });
});