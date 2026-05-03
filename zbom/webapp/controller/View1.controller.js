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

// ✅ Create JSON model and store data
    var oHeaderData = {
        Material: sMat,
        Plant: sPlant,
        // Usage: sUsage
    };

var oModel = new sap.ui.model.json.JSONModel(oHeaderData);
    this.getOwnerComponent().setModel(oModel, "headerModel");

            this.getOwnerComponent().getRouter().navTo("RouteBOMItem");
        },

           onInit: function () {
    var oRouter = this.getOwnerComponent().getRouter();
    oRouter.getRoute("RouteView1").attachPatternMatched(this._onRouteMatched, this);
},

_onRouteMatched: function () {
    this._resetForm();
},

_resetForm: function () {
    this.byId("inpMaterial3").setValue("");
    this.byId("inpPlant3").setValue("");
    this.byId("inpBomUsage3").setValue("");
    this.byId("inpCopyMaterial3").setValue("");
    this.byId("inpCopyPlant3").setValue("");
    this.byId("inpCopyAltBom3").setValue("");
},

        onMaterialValueHelp: function () {
            MessageToast.show("Value Help Requested");
        },

        onPlantValueHelp: function () {
            MessageToast.show("Value Help Requested");
        }
    });
});